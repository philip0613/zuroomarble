export default async function handler(req, res) {
    const { user_id } = req.query; // 누구의 판을 가져올지 확인
    if (!user_id) return res.status(400).json({ error: '로그인이 필요합니다.' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // user_id가 일치하는 데이터만 가져옴 (eq.은 equal이라는 뜻)
    const response = await fetch(`${supabaseUrl}/rest/v1/custom_boards?user_id=eq.${user_id}&select=*`, {
        method: 'GET',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });

    if (!response.ok) return res.status(500).json({ error: 'DB 불러오기 실패' });
    
    const data = await response.json();
    return res.status(200).json(data);
}
