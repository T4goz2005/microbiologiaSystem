import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    TextInput, Alert, ActivityIndicator, Modal, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// ⚠️ Ajuste o IP conforme necessário (localhost para Web, 10.0.2.2 para Emulador Android, ou IP da rede)
const API_URL = "http://localhost:3001/api"; 

export default function RealizarAvaliacao({ route, navigation }) {
    // Recebe os dados do paciente vindos da tela anterior
    const { pacienteId, pacienteNome } = route.params;

    const [modelos, setModelos] = useState([]);
    const [modeloSelecionado, setModeloSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    
    // Estado para as respostas do formulário dinâmico
    const [respostas, setRespostas] = useState({});
    // Estado para o fator de risco (Faltas)
    const [faltas, setFaltas] = useState('0'); 

    // Controle do Modal de Seleção
    const [modalVisible, setModalVisible] = useState(false);

    // Função auxiliar para alertas (Web/Mobile)
    const mostrarAlerta = (titulo, mensagem, onOk = null) => {
        if (Platform.OS === 'web') {
            window.alert(`${titulo}\n\n${mensagem}`);
            if (onOk) onOk();
        } else {
            Alert.alert(titulo, mensagem, onOk ? [{ text: "OK", onPress: onOk }] : [{ text: "OK" }]);
        }
    };

    // 1. Buscar Modelos Disponíveis ao abrir a tela
    useEffect(() => {
        const fetchModelos = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await fetch(`${API_URL}/modelos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setModelos(data);
                
                // Opcional: Selecionar o primeiro automaticamente se existir
                if(data.length > 0) setModeloSelecionado(data[0]); 
            } catch (error) {
                console.error("Erro ao buscar modelos:", error);
                mostrarAlerta("Erro", "Falha ao carregar os modelos de avaliação.");
            } finally {
                setLoading(false);
            }
        };
        fetchModelos();
    }, []);

    // 2. Função para atualizar uma resposta específica
    const handleRespostaChange = (perguntaTitulo, texto) => {
        setRespostas(prev => ({ ...prev, [perguntaTitulo]: texto }));
    };

    // 3. Enviar Avaliação para o Backend
    const handleSalvar = async () => {
        if (!modeloSelecionado) return mostrarAlerta("Atenção", "Selecione um modelo de avaliação.");

        setSalvando(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            // Monta o objeto para enviar
            const payload = {
                paciente_id: pacienteId,
                modelo_id: modeloSelecionado.id,
                faltas: parseInt(faltas) || 0, // Garante número
                respostas: respostas // Objeto com as respostas do questionário
            };

            const response = await fetch(`${API_URL}/avaliacoes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Feedback Visual do Risco Calculado
                let mensagem = `Avaliação salva com sucesso!\nRisco Calculado: ${result.risco_calculado}%`;
                if (result.risco_calculado > 50) mensagem += "\n⚠️ ATENÇÃO: Risco Alto!";

                mostrarAlerta("Concluído", mensagem, () => navigation.goBack());
            } else {
                const err = await response.json();
                mostrarAlerta("Erro", err.error || "Falha ao salvar avaliação.");
            }
        } catch (error) {
            console.error(error);
            mostrarAlerta("Erro", "Erro de conexão com o servidor.");
        } finally {
            setSalvando(false);
        }
    };

    // Renderiza os campos do modelo escolhido
    const renderCamposDinamicos = () => {
        if (!modeloSelecionado) return <Text style={styles.aviso}>Selecione um modelo acima para começar.</Text>;
        if (!modeloSelecionado.campos || modeloSelecionado.campos.length === 0) return <Text style={styles.aviso}>Este modelo não possui perguntas configuradas.</Text>;

        // Tratamento para garantir que é um array (caso venha como string do banco)
        let listaCampos = modeloSelecionado.campos;
        if (typeof listaCampos === 'string') {
            try {
                listaCampos = JSON.parse(listaCampos);
            } catch (e) {
                return <Text>Erro ao ler campos do modelo.</Text>;
            }
        }

        return listaCampos.map((campo, index) => (
            <View key={index} style={styles.campoContainer}>
                <Text style={styles.labelCampo}>{index + 1}. {campo.titulo}</Text>
                
                {campo.tipo === 'multipla_escolha' ? (
                    <View style={styles.opcoesContainer}>
                        {campo.opcoes.split(',').map((opcao, i) => {
                            const opcaoLimpa = opcao.trim();
                            const isSelected = respostas[campo.titulo] === opcaoLimpa;
                            return (
                                <TouchableOpacity 
                                    key={i} 
                                    style={[styles.btnOpcao, isSelected && styles.btnOpcaoAtiva]}
                                    onPress={() => handleRespostaChange(campo.titulo, opcaoLimpa)}
                                >
                                    <Text style={[styles.textOpcao, isSelected && styles.textOpcaoAtiva]}>
                                        {opcaoLimpa}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <TextInput 
                        style={[styles.input, campo.tipo === 'texto_longo' && {height: 80, textAlignVertical: 'top'}]}
                        multiline={campo.tipo === 'texto_longo'}
                        placeholder="Sua resposta..."
                        value={respostas[campo.titulo] || ''}
                        onChangeText={(text) => handleRespostaChange(campo.titulo, text)}
                    />
                )}
            </View>
        ));
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.headerTitle}>Avaliar: {pacienteNome}</Text>

                {loading ? <ActivityIndicator size="large" color="#2E86FF" /> : (
                    <>
                        {/* 1. SELETOR DE MODELO */}
                        <Text style={styles.labelSection}>1. Escolha o Modelo</Text>
                        <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <MaterialCommunityIcons name="file-document-edit-outline" size={24} color="#2E86FF" />
                                <Text style={styles.selectorText}>
                                    {modeloSelecionado ? modeloSelecionado.nome : "Toque para selecionar..."}
                                </Text>
                            </View>
                            <Ionicons name="chevron-down" size={24} color="#555" />
                        </TouchableOpacity>

                        {/* 2. FATOR DE RISCO (FALTAS) */}
                        <Text style={styles.labelSection}>2. Dados de Risco</Text>
                        <View style={styles.riscoBox}>
                            <Text style={styles.labelRisco}>Número de Faltas / Ausências:</Text>
                            <TextInput 
                                style={styles.inputRisco}
                                keyboardType="numeric"
                                value={faltas}
                                onChangeText={setFaltas}
                                placeholder="0"
                            />
                            <Text style={styles.dicaRisco}>*Usado para o cálculo automático de risco (70%)</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* 3. QUESTIONÁRIO DINÂMICO */}
                        <Text style={styles.labelSection}>3. Preencha o Questionário</Text>
                        {renderCamposDinamicos()}

                        <TouchableOpacity 
                            style={[styles.btnSalvar, salvando && {backgroundColor: '#AAA'}]} 
                            onPress={handleSalvar}
                            disabled={salvando}
                        >
                            {salvando ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.textBtnSalvar}>FINALIZAR AVALIAÇÃO</Text>
                            )}
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {/* MODAL DE SELEÇÃO DE MODELO */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Modelos Disponíveis</Text>
                        <ScrollView style={{maxHeight: 300}}>
                            {modelos.map(m => (
                                <TouchableOpacity 
                                    key={m.id} 
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setModeloSelecionado(m);
                                        setRespostas({}); // Limpa respostas ao trocar de modelo
                                        setModalVisible(false);
                                    }}
                                >
                                    <MaterialCommunityIcons name="text-box-outline" size={20} color="#555" />
                                    <Text style={styles.modalItemText}>{m.nome}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F4FF', padding: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 20 },
    
    labelSection: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 10, marginTop: 10 },
    
    // Seletor
    selector: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, 
        borderWidth: 1, borderColor: '#E2E8F0', elevation: 1
    },
    selectorText: { fontSize: 16, color: '#333', marginLeft: 10, fontWeight: '500' },

    // Box de Risco
    riscoBox: { 
        backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, 
        borderLeftWidth: 5, borderLeftColor: '#F59E0B', elevation: 1
    },
    labelRisco: { fontWeight: '600', color: '#333', marginBottom: 5 },
    inputRisco: { 
        backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, 
        borderColor: '#CBD5E1', fontSize: 18, fontWeight: 'bold', color: '#333' 
    },
    dicaRisco: { fontSize: 12, color: '#64748B', marginTop: 5, fontStyle: 'italic' },

    divider: { height: 1, backgroundColor: '#CBD5E1', marginVertical: 15 },

    // Campos Dinâmicos
    aviso: { color: '#64748B', fontStyle: 'italic', marginBottom: 20 },
    campoContainer: { marginBottom: 20 },
    labelCampo: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
    input: { 
        backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, 
        borderColor: '#CBD5E1', fontSize: 16, color: '#333' 
    },

    opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    btnOpcao: { 
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, 
        backgroundColor: '#E2E8F0', marginRight: 10, marginBottom: 10 
    },
    btnOpcaoAtiva: { backgroundColor: '#2E86FF' },
    textOpcao: { color: '#475569', fontWeight: '600' },
    textOpcaoAtiva: { color: 'white' },

    // Botão Salvar
    btnSalvar: { 
        backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', 
        marginTop: 20, elevation: 3, shadowColor: "#10B981", shadowOpacity: 0.3, shadowOffset: {width:0, height:4}
    },
    textBtnSalvar: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
    modalItem: { 
        padding: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', 
        flexDirection: 'row', alignItems: 'center' 
    },
    modalItemText: { fontSize: 16, marginLeft: 10, color: '#333' },
    modalClose: { backgroundColor: '#EF4444', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 }
});