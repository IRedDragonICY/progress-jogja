import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://snpygntfpumljzhikwym.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Authentication functions
const signInWithEmailAndPassword = async (_, email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return { user: data.user, session: data.session }
}

const sendPasswordResetEmail = async (_, email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
  return true
}

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}

const onAuthStateChanged = (_, callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      callback(session?.user || null)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })

  return () => subscription.unsubscribe()
}

// Mock auth object for compatibility
const auth = {
  currentUser: null
}

export {
  supabase,
  auth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
}
