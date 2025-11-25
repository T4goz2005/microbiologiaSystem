// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // 1. Obter o token do cabeçalho
    // Espera-se: Authorization: Bearer [token]
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido ou inválido.' });
    }
    
    // Retira 'Bearer ' para isolar o token
    const token = authHeader.substring(7); 

    try {
        // 2. Verificar e decodificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Anexar as informações do usuário à requisição (útil para a rota)
        req.user = decoded.user;
        
        // 4. Se tudo OK, prosseguir para a próxima função (o controlador da rota)
        next(); 

    } catch (e) {
        // Se o token for inválido ou expirado
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

module.exports = auth;