export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능합니다.' });
    
    const { board_name, custom_tiles } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // Supabase DB의 custom_boards 테이블에 데이터 넣기
    const response = await fetch(`${supabaseUrl}/rest/v1/custom_boards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ board_name, custom_tiles })
    });

    if (!response.ok) return res.status(500).json({ error: 'DB 저장 실패' });
    return res.status(200).json({ message: '저장 성공!' });
}
