import { serve } from './mod.ts'

serve(Deno.args[0], parseInt(Deno.args[1]))
