import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert, 
    ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Ex: http://192.168.1.10:3001/api/login
const API_LOGIN_URL = "http://localhost:3001/api/login"

const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert("Atenção", "Preencha e-mail e senha.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Se o backend retornar 401 ou 500, exibe a mensagem de erro
                throw new Error(data.error || "Falha na conexão ou credenciais inválidas.");
            }

            // Salva o token JWT no AsyncStorage
            await AsyncStorage.setItem('userToken', data.token);
            
            // Chama a função passada pelo App.js para indicar que o login foi feito
            onLoginSuccess(); 

        } catch (error) {
            console.error("Erro de Login:", error);
            Alert.alert("Falha no Login", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>INOVATECH MICROBIOLOGIA</Text>
            <Text style={styles.subtitle}>Análise e Desenvolvimento de Sistemas</Text>

            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder="E-mail"
                    placeholderTextColor="#003f5c"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <View style={styles.inputView}>
                <TextInput
                    style={styles.inputText}
                    placeholder="Senha"
                    placeholderTextColor="#003f5c"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />
            </View>
            
            <TouchableOpacity 
                onPress={handleLogin} 
                style={styles.loginBtn}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginText}>ENTRAR</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5', // Fundo leve
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#2E86FF", // Cor primária do seu sistema
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#555",
        marginBottom: 40,
    },
    inputView: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 25,
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        padding: 20,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    inputText: {
        height: 50,
        color: "black",
    },
    forgotBtn: {
        width: "80%",
        alignItems: 'flex-end',
        marginTop: 10
    },
    forgotText: {
        color: "#555",
        fontSize: 14,
    },
    loginBtn: {
        width: "80%",
        backgroundColor: "#2E86FF",
        borderRadius: 25,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 10
    },
    loginText: {
        color: "white",
        fontWeight: 'bold'
    }
});