// App.js (Seu arquivo principal)

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './SRC/pages/login'; // Importa a tela de Login
import PacientesScreen from './SRC/pages/Home'; // ⚠️ Importe sua tela principal aqui

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    // Função para verificar se o usuário já está logado
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token); // Define o token (se existir)
        } catch (e) {
            console.error("Erro ao ler token:", e);
        } finally {
            setIsLoading(false); // Termina o estado de carregamento
        }
    };

    useEffect(() => {
        checkToken();
    }, []);

    // Função para ser chamada quando o login for bem-sucedido
    const handleLoginSuccess = async () => {
        // Re-lê o token recém-salvo e atualiza o estado
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
    };

    // Função para ser chamada no Logout
    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
    };

    if (isLoading) {
        // Exibe um carregador enquanto verifica o token
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2E86FF" />
            </View>
        );
    }

    // A lógica de roteamento aqui:
    if (userToken) {
        // Se houver token, mostra a tela principal.
        // Você pode passar a função de logout para que ela possa ser chamada na tela de Pacientes
        return <PacientesScreen onLogout={handleLogout} />;
    } else {
        // Se não houver token, mostra a tela de Login.
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});