// Supabase (PostgREST) devuelve como máximo 1.000 filas por petición, aunque
// pidas más con .limit(). Esta función pide por tandas hasta tenerlas todas.
//
// Uso:
//   const { data, error } = await fetchAllRows((from, to) =>
//     supabase.from("set_logs").select("*").eq("client_id", id)
//       .order("exercise_set_id").range(from, to));
//
// IMPORTANTE: la consulta debe tener un .order() por una columna única (o
// combinación única) para que las tandas no se solapen ni se salten filas.

const PAGE_SIZE = 1000;
const MAX_PAGES = 50; // tope de seguridad: 50.000 filas

type PageResult<T> = { data: T[] | null; error: { message: string } | null };

export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const all: T[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    const from = p * PAGE_SIZE;
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { data: all, error };
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return { data: all, error: null };
}
