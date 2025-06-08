import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

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

    // Get all unique email addresses from tasks
    const { data: emailData, error: emailError } = await supabase
      .from('tasks')
      .select('email_from')
      .not('email_from', 'is', null)
      .not('email_from', 'eq', '')

    if (emailError) {
      throw emailError
    }

    const uniqueEmails = [...new Set(emailData.map(item => item.email_from))]
    console.log(`Found ${uniqueEmails.length} unique email addresses`)

    for (const email of uniqueEmails) {
      try {
        await sendDailySummary(supabase, postmarkToken, fromEmail, email)
        console.log(`Daily summary sent to ${email}`)
      } catch (error) {
        console.error(`Failed to send summary to ${email}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent: uniqueEmails.length,
        message: 'Daily summaries sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending daily summaries:', error)
    
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

async function sendDailySummary(supabase: any, postmarkToken: string, fromEmail: string, userEmail: string) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Get task statistics for this user
  const { data: allTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('email_from', userEmail)

  if (tasksError) {
    throw tasksError
  }

  const pendingTasks = allTasks.filter(task => !task.completed)
  const completedYesterday = allTasks.filter(task => 
    task.completed && task.updated_at.startsWith(yesterday)
  )
  const dueToday = pendingTasks.filter(task => task.due_date === today)
  const overdue = pendingTasks.filter(task => 
    task.due_date && task.due_date < today
  )

  // Skip sending if no meaningful data
  if (pendingTasks.length === 0 && completedYesterday.length === 0) {
    return
  }

  const summaryMessage = generateDailySummaryMessage({
    userEmail,
    totalPending: pendingTasks.length,
    completedYesterday: completedYesterday.length,
    dueToday,
    overdue,
    highPriorityTasks: pendingTasks.filter(task => task.priority === 'high')
  })

  const emailResponse = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': postmarkToken,
    },
    body: JSON.stringify({
      From: fromEmail,
      To: userEmail,
      Subject: `📊 Your Daily Task Summary - ${new Date().toLocaleDateString()}`,
      TextBody: summaryMessage,
      ReplyTo: fromEmail,
    }),
  })

  if (!emailResponse.ok) {
    throw new Error(`Failed to send email: ${await emailResponse.text()}`)
  }
}

function generateDailySummaryMessage(data: any): string {
  const { userEmail, totalPending, completedYesterday, dueToday, overdue, highPriorityTasks } = data
  
  let message = `📊 Daily Task Summary\n`
  message += `=====================================\n\n`

  // Overview
  message += `📈 Overview:\n`
  message += `   • ${totalPending} pending tasks\n`
  if (completedYesterday > 0) {
    message += `   • ${completedYesterday} completed yesterday 🎉\n`
  }
  message += `\n`

  // Today's focus
  if (dueToday.length > 0) {
    message += `🎯 Due Today (${dueToday.length} tasks):\n`
    dueToday.slice(0, 5).forEach((task, index) => {
      message += `   ${index + 1}. ${task.title}`
      if (task.priority === 'high') message += ` [HIGH PRIORITY]`
      message += `\n`
    })
    if (dueToday.length > 5) {
      message += `   ... and ${dueToday.length - 5} more\n`
    }
    message += `\n`
  }

  // Overdue items
  if (overdue.length > 0) {
    message += `⚠️  Overdue (${overdue.length} tasks):\n`
    overdue.slice(0, 3).forEach((task, index) => {
      message += `   ${index + 1}. ${task.title} (Due: ${new Date(task.due_date).toLocaleDateString()})\n`
    })
    if (overdue.length > 3) {
      message += `   ... and ${overdue.length - 3} more\n`
    }
    message += `\n`
  }

  // High priority tasks
  if (highPriorityTasks.length > 0) {
    message += `🔴 High Priority Tasks (${highPriorityTasks.length}):\n`
    highPriorityTasks.slice(0, 3).forEach((task, index) => {
      message += `   ${index + 1}. ${task.title}`
      if (task.due_date) message += ` (Due: ${new Date(task.due_date).toLocaleDateString()})`
      message += `\n`
    })
    if (highPriorityTasks.length > 3) {
      message += `   ... and ${highPriorityTasks.length - 3} more\n`
    }
    message += `\n`
  }

  message += `💡 Tip: Reply to this email with new tasks, or visit your TaskFlow dashboard to manage everything!\n`
  message += `\nHave a productive day! 🚀`

  return message
}