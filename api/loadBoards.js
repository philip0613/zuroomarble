export default async function handler(req, res) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // Supabase DB에서 만들어진 판 목록 가져오기
    const response = await fetch(`${supabaseUrl}/rest/v1/custom_boards?select=*`, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });

    if (!response.ok) return res.status(500).json({ error: 'DB 불러오기 실패' });
    
    const data = await response.json();
    return res.status(200).json(data);
}
