export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능합니다.' });
    
    // 프론트에서 user_id도 같이 받아옴
    const { board_name, custom_tiles, user_id } = req.body; 
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    const response = await fetch(`${supabaseUrl}/rest/v1/custom_boards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ board_name, custom_tiles, user_id }) // user_id 저장!
    });

    if (!response.ok) return res.status(500).json({ error: 'DB 저장 실패' });
    return res.status(200).json({ message: '저장 성공!' });
}
