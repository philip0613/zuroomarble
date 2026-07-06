export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 가능합니다.' });

    const { action, email, password } = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // action에 따라 회원가입 주소인지 로그인 주소인지 결정
    const url = action === 'signup' 
        ? `${supabaseUrl}/auth/v1/signup` 
        : `${supabaseUrl}/auth/v1/token?grant_type=password`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error_description || data.msg || '인증 실패');
        
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
