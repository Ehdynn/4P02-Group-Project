import supabase from '../supabase'

export async function getAssignmentByKey(key) {
  const { data, error } = await supabase
    .from('Assignments')
    .select('id')
    .eq('key', key.trim())
    .single()

  if (error) {
    return { data: null, error: 'No assignment found with that key.' }
  }

  return { data, error: null }
}