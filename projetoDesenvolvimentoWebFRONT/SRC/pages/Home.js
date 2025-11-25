import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // 📌 Importante para atualizar ao voltar

// ⚠️ Ajuste o IP (localhost para Web/PC ou 10.0.2.2 para Emulador)
const API_URL = "http://localhost:3001/api"; 

export default function Home({ navigation, onLogout }) {
  // Estado para guardar os números
  const [stats, setStats] = useState({
    pacientes: '-',
    exames: '-'
  });

  // Função para buscar os dados e contar
  const fetchEstatisticas = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      // 1. Buscar Pacientes
      const resPacientes = await fetch(`${API_URL}/pacientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataPacientes = await resPacientes.json();

      // 2. Buscar Exames
      const resExames = await fetch(`${API_URL}/exames`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataExames = await resExames.json();

      // 3. Atualizar o estado com a contagem (.length)
      // Verificamos se é array para evitar erro caso a API falhe
      setStats({
        pacientes: Array.isArray(dataPacientes) ? dataPacientes.length : 0,
        exames: Array.isArray(dataExames) ? dataExames.length : 0
      });

    } catch (error) {
      console.log("Erro ao carregar estatísticas:", error);
    }
  };

  // 📌 useFocusEffect: Roda toda vez que a tela ganha foco (ex: ao voltar de um cadastro)
  useFocusEffect(
    useCallback(() => {
      fetchEstatisticas();
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#2E86FF" />

      {/* HEADER COMPACTO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Profissional</Text>
          <Text style={styles.title}>Sistema de exames microbiologia</Text>
        </View>
        {/* Botão de Sair */}
        <TouchableOpacity onPress={onLogout} style={styles.headerLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CARD FLUTUANTE DE RESUMO (STATS) */}
      <View style={styles.statsContainer}>
        
        {/* Contador de Pacientes */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pacientes}</Text>
          <Text style={styles.statLabel}>Pacientes</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        {/* Contador de Exames */}
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.exames}</Text>
          <Text style={styles.statLabel}>Exames Realizados</Text>
        </View>

      </View>

      <Text style={styles.sectionTitle}>Acesso Rápido</Text>

      {/* GRID DE MENU */}
      <View style={styles.menuGrid}>
        
        {/* Card 1: Pacientes */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('PacientesTab')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="people" size={24} color="#2E86FF" />
          </View>
          <Text style={styles.menuTitle}>Pacientes</Text>
          <Text style={styles.menuSubtitle}>Gerenciar cadastros</Text>
        </TouchableOpacity>

        {/* Card 2: Histórico */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('HistoricoAvaliacoesScreen')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="clipboard" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.menuTitle}>Histórico</Text>
          <Text style={styles.menuSubtitle}>Ver laudos emitidos</Text>
        </TouchableOpacity>

        {/* Card 3: Novo Exame (Largo) */}
        <TouchableOpacity
          style={[styles.menuItem, { width: '100%' }]} 
          onPress={() => navigation.navigate('PacientesTab')} 
        >
          <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
            <MaterialCommunityIcons name="microscope" size={24} color="#9C27B0" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.menuTitle}>Realizar Novo Exame</Text>
            <Text style={styles.menuSubtitle}>Selecione um paciente para iniciar Urina ou Escarro</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', 
  },
  contentContainer: {
    paddingBottom: 30,
  },
  // --- Header ---
  header: {
    backgroundColor: '#2E86FF',
    paddingTop: 50, 
    paddingBottom: 40, 
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#B3D9FF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  headerLogout: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  
  // --- Card Flutuante (Stats) ---
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -25, // Efeito flutuante sobre o header
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'space-around', // Distribui igualmente
    alignItems: 'center',
  },
  statCard: {
    alignItems: 'center',
    flex: 1, // Ocupa espaço igual
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E2E8F0',
  },

  // --- Grid de Menu ---
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#334155',
    marginLeft: 22,
    marginTop: 30,
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  menuItem: {
    width: '48%', 
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    flexDirection: 'row', 
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexWrap: 'wrap', 
    alignContent: 'center'
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 10,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
    width: '100%',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    width: '100%',
  },
});