import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// ⚠️ Ajuste o IP (localhost para Web/PC ou 10.0.2.2 para Emulador)
const API_URL = "http://localhost:3001/api/exames"; 

export default function HistoricoAvaliacoes({ route, navigation }) {
    const { pacienteId } = route.params || {};

    const [exames, setExames] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função auxiliar para alertas
    const mostrarAlerta = (titulo, mensagem, onSim = null) => {
        if (Platform.OS === 'web') {
            if (onSim) {
                if (window.confirm(`${titulo}\n\n${mensagem}`)) onSim();
            } else {
                window.alert(`${titulo}\n\n${mensagem}`);
            }
        } else {
            if (onSim) {
                Alert.alert(titulo, mensagem, [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sim", style: "destructive", onPress: onSim }
                ]);
            } else {
                Alert.alert(titulo, mensagem);
            }
        }
    };

    const fetchExames = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const url = pacienteId ? `${API_URL}/${pacienteId}` : API_URL;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setExames(data);
            } else {
                console.log("Erro na API:", response.status);
            }
        } catch (error) {
            console.log("Erro de conexão:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = (id) => {
        mostrarAlerta(
            "Excluir Exame", 
            "Tem certeza que deseja excluir este exame permanentemente?", 
            async () => {
                try {
                    const token = await AsyncStorage.getItem('userToken');
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        setExames(prevExames => prevExames.filter(item => item.id !== id));
                    } else {
                        mostrarAlerta("Erro", "Não foi possível excluir o exame.");
                    }
                } catch (error) {
                    mostrarAlerta("Erro", "Erro de conexão ao excluir.");
                }
            }
        );
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchExames();
        });
        return unsubscribe;
    }, [navigation, pacienteId]);

    const renderItem = ({ item }) => {
        const status = item.status || 'CONCLUIDO';
        const isPendente = status === 'PENDENTE';
        
        const corStatus = isPendente ? '#F59E0B' : '#10B981';
        const iconeStatus = isPendente ? 'clock-outline' : 'check-circle-outline';

        const dataFormatada = new Date(item.data_exame).toLocaleDateString('pt-BR') + ' às ' + new Date(item.data_exame).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const tipoExame = item.tipo_exame || 'GERAL';

        // --- LÓGICA PARA PEGAR O LAUDO/BACTÉRIA ---
        let laudoTexto = "Sem resultado informado";
        try {
            let resp = item.respostas;
            // Se vier como string do banco, converte para objeto
            if (typeof resp === 'string') resp = JSON.parse(resp);
            
            if (resp && resp.laudo) {
                laudoTexto = resp.laudo;
            }
        } catch (e) {
            laudoTexto = "Erro ao ler laudo";
        }

        return (
            <View style={[styles.card, { borderLeftColor: corStatus }]}>
                <View style={styles.cardHeader}>
                    <View style={{flex: 1, paddingRight: 10}}>
                        {/* Nome do Paciente */}
                        {item.nome_paciente && (
                            <View style={styles.rowNome}>
                                <Ionicons name="person" size={16} color="#64748B" />
                                <Text style={styles.pacienteNome}>{item.nome_paciente}</Text>
                            </View>
                        )}
                        
                        {/* Tipo de Exame */}
                        <Text style={styles.exameTipo}>{tipoExame}</Text>

                        {/* 🆕 CAMPO NOVO: LAUDO / BACTÉRIA */}
                        {!isPendente && (
                            <View style={styles.laudoContainer}>
                                <MaterialCommunityIcons name="bacteria-outline" size={14} color="#4A90E2" style={{marginTop: 2}}/>
                                <Text style={styles.laudoText} numberOfLines={2}>
                                    {laudoTexto}
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    {/* Badge de Status */}
                    <View style={[styles.statusBadge, { backgroundColor: corStatus + '20' }]}> 
                        <MaterialCommunityIcons name={iconeStatus} size={14} color={corStatus} />
                        <Text style={[styles.statusTexto, { color: corStatus }]}>
                            {isPendente ? "PENDENTE" : "CONCLUÍDO"}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
                        <Text style={styles.data}>{dataFormatada}</Text>
                    </View>
                    
                    <View style={styles.actionsRow}>
                        <TouchableOpacity 
                            style={styles.btnExcluir}
                            onPress={() => handleExcluir(item.id)}
                        >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.btnAcao, { backgroundColor: isPendente ? '#F59E0B' : '#2E86FF' }]}
                            onPress={() => {
                                navigation.navigate('RealizarExame', { 
                                    exameExistente: item, 
                                    pacienteId: item.paciente_id,
                                    pacienteNome: item.nome_paciente || 'Paciente'
                                });
                            }}
                        >
                            <Ionicons name={isPendente ? "play" : "pencil"} size={14} color="#FFF" />
                            <Text style={styles.textBtnAcao}>
                                {isPendente ? "Continuar" : "Editar"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {navigation.canGoBack() && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>
                    {pacienteId ? "Histórico do Paciente" : "Histórico Geral"}
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2E86FF" style={{marginTop: 50}} />
            ) : (
                <FlatList
                    data={exames}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchExames} colors={['#2E86FF']} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="clipboard-text-off-outline" size={64} color="#CBD5E1" />
                            <Text style={styles.emptyText}>Nenhum exame encontrado.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingTop: 20 },
    
    headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { marginRight: 10, padding: 5 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },

    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 6, 
        elevation: 3,
        shadowColor: "#64748B",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 }
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    rowNome: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    pacienteNome: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginLeft: 6 },
    exameTipo: { fontSize: 14, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
    
    // Estilos do Laudo
    laudoContainer: { flexDirection: 'row', marginTop: 4 },
    laudoText: { fontSize: 13, color: '#333', marginLeft: 5, fontStyle: 'italic', flex: 1 },

    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 12 
    },
    statusTexto: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    
    dateRow: { flexDirection: 'row', alignItems: 'center' },
    data: { fontSize: 12, color: '#94A3B8', marginLeft: 4 },
    
    actionsRow: { flexDirection: 'row', alignItems: 'center' },

    btnExcluir: {
        padding: 8,
        marginRight: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 8
    },

    btnAcao: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        elevation: 1
    },
    textBtnAcao: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4
    },
    
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 10, color: '#94A3B8', fontSize: 16 }
});