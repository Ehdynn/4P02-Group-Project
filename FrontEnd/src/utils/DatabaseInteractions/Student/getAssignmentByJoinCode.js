import supabase from '../supabase'

export async function getAssignmentByJoinCode(joinCode) {
  const { data, error } = await supabase
    .from('Assignments')
    .select('id')
    .eq('key', joinCode.trim())
    .single()

  if (error) {
    return { data: null, error: 'No course found with that join code.' }
  }

  return { data, error: null }
}