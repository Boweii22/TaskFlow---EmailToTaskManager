import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

interface EmailWebhookPayload {
  From: string;
  Subject: string;
  TextBody: string;
  HtmlBody: string;
  To: string;
  MessageID: string;
  Date: string;
}

interface ParsedEmailContent {
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const postmarkToken = Deno.env.get('POSTMARK_SERVER_TOKEN')!
    const fromEmail = Deno.env.get('POSTMARK_FROM_EMAIL') || 'tasks@yourdomain.com'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const emailData: EmailWebhookPayload = await req.json()
    
    console.log('Received email:', {
      from: emailData.From,
      subject: emailData.Subject,
      to: emailData.To
    })

    // Parse email content
    const parsedContent = parseEmailContent(emailData.Subject, emailData.TextBody || emailData.HtmlBody)
    
    // Create task in database
    const { data: task, error: insertError } = await supabase
      .from('tasks')
      .insert([{
        title: parsedContent.title,
        description: parsedContent.description,
        due_date: parsedContent.dueDate,
        priority: parsedContent.priority,
        tags: parsedContent.tags,
        email_from: emailData.From,
        completed: false
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error creating task:', insertError)
      throw insertError
    }

    console.log('Task created:', task.id)

    // Send confirmation email
    const confirmationMessage = generateConfirmationMessage(task)
    
    const emailResponse = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkToken,
      },
      body: JSON.stringify({
        From: fromEmail,
        To: emailData.From,
        Subject: `✅ Task created: ${task.title}`,
        TextBody: confirmationMessage,
        ReplyTo: fromEmail,
      }),
    })

    if (!emailResponse.ok) {
      console.error('Failed to send confirmation email:', await emailResponse.text())
    } else {
      console.log('Confirmation email sent successfully')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        taskId: task.id,
        message: 'Task created and confirmation sent'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing email webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function parseEmailContent(subject: string, body: string): ParsedEmailContent {
  const title = subject.trim() || 'Untitled Task'
  let description = (body || '').trim()
  let dueDate: string | null = null
  let priority: 'low' | 'medium' | 'high' = 'medium'
  let tags: string[] = []

  // Parse due date
  const dueDatePatterns = [
    /Due:\s*(\d{4}-\d{2}-\d{2})/i,
    /Due:\s*(\d{2}\/\d{2}\/\d{4})/i,
    /Due:\s*(today)/i,
    /Due:\s*(tomorrow)/i,
    /Due:\s*(\d+)\s*days?/i,
  ]

  for (const pattern of dueDatePatterns) {
    const match = description.match(pattern)
    if (match) {
      const dateStr = match[1].toLowerCase()
      
      if (dateStr === 'today') {
        dueDate = new Date().toISOString().split('T')[0]
      } else if (dateStr === 'tomorrow') {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        dueDate = tomorrow.toISOString().split('T')[0]
      } else if (/^\d+$/.test(dateStr)) {
        const days = parseInt(dateStr)
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)
        dueDate = futureDate.toISOString().split('T')[0]
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        dueDate = dateStr
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('/')
        dueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
      
      description = description.replace(match[0], '').trim()
      break
    }
  }

  // Parse priority
  const priorityPattern = /Priority:\s*(high|medium|low)/i
  const priorityMatch = description.match(priorityPattern)
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase() as 'low' | 'medium' | 'high'
    description = description.replace(priorityMatch[0], '').trim()
  }

  // Parse tags
  const tagsPattern = /Tags:\s*([^\n\r]+)/i
  const tagsMatch = description.match(tagsPattern)
  if (tagsMatch) {
    tags = tagsMatch[1]
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
    description = description.replace(tagsMatch[0], '').trim()
  }

  return {
    title,
    description,
    dueDate,
    priority,
    tags,
  }
}

function generateConfirmationMessage(task: any): string {
  let message = `✅ Your task "${task.title}" has been successfully created!\n\n`
  
  message += `📋 Details:\n`
  if (task.description) {
    message += `   Description: ${task.description}\n`
  }
  message += `   Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}\n`
  
  if (task.due_date) {
    const dueDate = new Date(task.due_date)
    message += `   Due Date: ${dueDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}\n`
  }
  
  if (task.tags && task.tags.length > 0) {
    message += `   Tags: ${task.tags.join(', ')}\n`
  }
  
  message += `\n🎯 You can manage this task and all your others at your TaskFlow dashboard.\n`
  message += `\n💡 Pro tip: Include "Due: tomorrow", "Priority: high", or "Tags: work, urgent" in your future emails for automatic parsing!`
  
  return message
}