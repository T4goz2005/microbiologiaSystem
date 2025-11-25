import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TouchableOpacity, 
    TextInput, Alert, ActivityIndicator, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Ajuste o IP conforme necessário
const API_URL = "http://localhost:3001/api"; 

export default function RealizarExame({ route, navigation }) {
    const { pacienteId, pacienteNome, exameExistente } = route.params || {};
    
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // DADOS DO EXAME
    const [tipoExame, setTipoExame] = useState(null); 
    const [amostra, setAmostra] = useState('');
    
    // URINA
    const [cled, setCled] = useState({ colonias: '' });
    
    // ESCARRO
    const [ziehl, setZiehl] = useState(''); 
    
    // GRAM (Comum aos dois)
    const [gram, setGram] = useState({ resultado: null, lote: '', validade: '' });
    
    // BIOQUÍMICA (Campos Detalhados)
    const [bioquimica, setBioquimica] = useState({});
    
    // LAUDO FINAL
    const [resultadoFinal, setResultadoFinal] = useState('');

    // --- CARREGAR DADOS PARA EDIÇÃO ---
    useEffect(() => {
        if (exameExistente) {
            console.log("Carregando dados para edição...");
            setIsEditing(true);
            
            let resp = exameExistente.respostas;

            // Tratamento para JSON stringificado se vier do banco como texto
            if (typeof resp === 'string') {
                try {
                    resp = JSON.parse(resp);
                } catch (e) {
                    console.error("Erro ao converter JSON:", e);
                    resp = {};
                }
            } else {
                resp = resp || {};
            }
            
            // Preenche os estados com os dados salvos
            if (resp.tipo_exame) setTipoExame(resp.tipo_exame.toLowerCase());
            setAmostra(resp.amostra || '');
            
            // Detalhes específicos
            if (resp.detalhes_especificos?.cled) setCled(resp.detalhes_especificos.cled);
            if (resp.detalhes_especificos?.ziehl_neelsen) setZiehl(resp.detalhes_especificos.ziehl_neelsen);
            
            // Gram e Bioquímica
            setGram(resp.gram || { resultado: null, lote: '', validade: '' });
            setBioquimica(resp.bioquimica || {});
            
            // Laudo
            setResultadoFinal(resp.laudo || '');
        }
    }, [exameExistente]);

    // Função genérica para atualizar campos da bioquímica
    const updateBio = (campo, valor) => {
        setBioquimica(prev => ({ ...prev, [campo]: valor }));
    };

    // --- VERIFICAÇÃO DE COMPLETUDE ---
    const verificarStatus = () => {
        if (tipoExame && resultadoFinal && resultadoFinal.trim().length > 0) {
            return 'CONCLUIDO';
        }
        return 'PENDENTE';
    };

    const mostrarAlerta = (titulo, msg, onOk) => {
        if (Platform.OS === 'web') {
            alert(`${titulo}: ${msg}`);
            if (onOk) onOk();
        } else {
            Alert.alert(titulo, msg, onOk ? [{ text: "OK", onPress: onOk }] : []);
        }
    };

    // --- SALVAR ---
    const handleSalvar = async () => {
        if (!tipoExame) {
            mostrarAlerta("Erro", "Selecione o tipo de exame.");
            return;
        }

        // Removida a validação obrigatória do laudo para permitir salvar rascunho
        // Mas se quiser obrigar para finalizar, pode descomentar ou ajustar a lógica
        
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            
            const respostas = {
                tipo_exame: tipoExame ? tipoExame.toUpperCase() : '',
                amostra: amostra,
                detalhes_especificos: tipoExame === 'urina' ? { cled } : { ziehl_neelsen: ziehl },
                gram: gram,
                bioquimica: bioquimica,
                laudo: resultadoFinal
            };

            const statusCalculado = verificarStatus();

            // ID do paciente: Se é novo, vem da rota. Se é edição, pega do objeto existente.
            // Importante: garantir que temos um ID válido
            const idPacienteFinal = pacienteId || exameExistente?.paciente_id;

            if (!idPacienteFinal) {
                throw new Error("ID do paciente não encontrado.");
            }

            const payload = {
                paciente_id: idPacienteFinal, 
                respostas: respostas,
                status: statusCalculado
            };

            let url = `${API_URL}/exames`;
            let method = 'POST';

            if (isEditing && exameExistente?.id) {
                url = `${API_URL}/exames/${exameExistente.id}`;
                method = 'PUT';
            }

            console.log(`Enviando ${method} para ${url}`);

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const msg = statusCalculado === 'PENDENTE' 
                    ? "Salvo como PENDENTE. Você pode continuar depois."
                    : "Exame CONCLUÍDO com sucesso!";
                
                mostrarAlerta("Sucesso", msg, () => navigation.goBack());
            } else {
                const errorText = await response.text();
                console.error("Erro Backend:", errorText);
                mostrarAlerta("Erro", "Falha ao salvar no servidor. Verifique o console.");
            }
        } catch (error) {
            console.error("Erro no handleSalvar:", error);
            mostrarAlerta("Erro", `Erro de conexão: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>
                {isEditing ? "Editar Exame" : `Novo Exame: ${pacienteNome}`}
            </Text>

             {isEditing && (
                <View style={styles.badgeEditando}>
                    <Text style={{color:'#856404', fontWeight: 'bold', textAlign: 'center'}}>✏️ Editando registro existente</Text>
                </View>
            )}

            {/* 1. SELEÇÃO DE TIPO */}
            <Text style={styles.label}>Tipo de Material:</Text>
            <View style={{flexDirection:'row', marginBottom:20}}>
                <TouchableOpacity 
                    style={[styles.btnOpt, tipoExame === 'urina' && styles.btnSel]} 
                    onPress={() => setTipoExame('urina')}>
                    <Text style={[styles.txtOpt, tipoExame === 'urina' && styles.txtSel]}>URINA</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.btnOpt, tipoExame === 'escarro' && styles.btnSel]} 
                    onPress={() => setTipoExame('escarro')}>
                    <Text style={[styles.txtOpt, tipoExame === 'escarro' && styles.txtSel]}>ESCARRO</Text>
                </TouchableOpacity>
            </View>

            {/* Formulário Dinâmico */}
            {tipoExame && (
                <>
                    <Text style={styles.label}>Amostra:</Text>
                    <TextInput style={styles.input} value={amostra} onChangeText={setAmostra} placeholder="Identificação..." />

                    {tipoExame === 'urina' ? (
                        <View style={styles.box}>
                            <Text style={styles.subTitle}>Ágar CLED</Text>
                            <TextInput style={styles.input} placeholder="Qtd Colônias" value={cled.colonias} onChangeText={t=>setCled({...cled, colonias:t})} />
                        </View>
                    ) : (
                        <View style={styles.box}>
                            <Text style={styles.subTitle}>Ziehl-Neelsen</Text>
                            <TextInput style={styles.input} placeholder="Resultado BAAR" value={ziehl} onChangeText={setZiehl} />
                        </View>
                    )}

                    <View style={styles.box}>
                        <Text style={styles.subTitle}>Gram</Text>
                        <TextInput style={styles.input} placeholder="Lote" value={gram.lote || ''} onChangeText={t=>setGram({...gram, lote:t})} />
                        <TextInput style={styles.input} placeholder="Validade (DD/MM/AAAA)" value={gram.validade || ''} onChangeText={t=>setGram({...gram, validade:t})} />
                        
                        <View style={{flexDirection:'row', justifyContent:'space-around', marginBottom:10, marginTop: 10}}>
                            <TouchableOpacity onPress={() => setGram({...gram, resultado: 'positivo'})} style={[styles.btnSmall, gram.resultado === 'positivo' && {backgroundColor:'#4CAF50'}]}>
                                <Text style={{color:'white', fontWeight:'bold'}}>POSITIVO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGram({...gram, resultado: 'negativo'})} style={[styles.btnSmall, gram.resultado === 'negativo' && {backgroundColor:'#F44336'}]}>
                                <Text style={{color:'white', fontWeight:'bold'}}>NEGATIVO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 5. BIOQUÍMICA (Condicional ao Gram) */}
                    {gram.resultado === 'positivo' && (
                        <View style={styles.box}>
                            <Text style={[styles.subTitle, {color:'#4CAF50'}]}>Bioquímica (Gram +)</Text>
                            
                            {/* TESTE DE CATALASE */}
                            <Text style={styles.sectionHeader}>1. Teste de Catalase</Text>
                            <TextInput style={styles.inputSmall} placeholder="Qtd. Colônias" value={bioquimica.catalase_colonias || ''} onChangeText={t => updateBio('catalase_colonias', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Coloração das Colônias" value={bioquimica.catalase_coloracao || ''} onChangeText={t => updateBio('catalase_coloracao', t)} />
                            <View style={styles.rowInput}>
                                <TextInput style={[styles.inputSmall, {flex:1, marginRight:5}]} placeholder="Lote" value={bioquimica.catalase_lote || ''} onChangeText={t => updateBio('catalase_lote', t)} />
                                <TextInput style={[styles.inputSmall, {flex:1}]} placeholder="Validade (DD/MM/AAAA)" value={bioquimica.catalase_validade || ''} onChangeText={t => updateBio('catalase_validade', t)} />
                            </View>

                            {/* TESTE DE COAGULASE */}
                            <Text style={styles.sectionHeader}>2. Teste de Coagulase</Text>
                            <TextInput style={styles.inputSmall} placeholder="Resultado" value={bioquimica.coagulase_resultado || ''} onChangeText={t => updateBio('coagulase_resultado', t)} />
                            <View style={styles.rowInput}>
                                <TextInput style={[styles.inputSmall, {flex:1, marginRight:5}]} placeholder="Lote Kit" value={bioquimica.coagulase_lote || ''} onChangeText={t => updateBio('coagulase_lote', t)} />
                                <TextInput style={[styles.inputSmall, {flex:1}]} placeholder="Validade Kit (DD/MM/AAAA)" value={bioquimica.coagulase_validade || ''} onChangeText={t => updateBio('coagulase_validade', t)} />
                            </View>
                            <View style={styles.rowInput}>
                                <TextInput style={[styles.inputSmall, {flex:1, marginRight:5}]} placeholder="Lote Tubo Estéril" value={bioquimica.coagulase_tubo_lote || ''} onChangeText={t => updateBio('coagulase_tubo_lote', t)} />
                                <TextInput style={[styles.inputSmall, {flex:1}]} placeholder="Validade Tubo (DD/MM/AAAA)" value={bioquimica.coagulase_tubo_validade || ''} onChangeText={t => updateBio('coagulase_tubo_validade', t)} />
                            </View>

                            {/* TESTE DE NOVOBIOCINA */}
                            <Text style={styles.sectionHeader}>3. Teste de Novobiocina</Text>
                            <TextInput style={styles.inputSmall} placeholder="Resultado" value={bioquimica.novobiocina_resultado || ''} onChangeText={t => updateBio('novobiocina_resultado', t)} />
                            <View style={styles.rowInput}>
                                <TextInput style={[styles.inputSmall, {flex:1, marginRight:5}]} placeholder="Lote Antibiótico" value={bioquimica.novobiocina_lote || ''} onChangeText={t => updateBio('novobiocina_lote', t)} />
                                <TextInput style={[styles.inputSmall, {flex:1}]} placeholder="Validade Anti. (DD/MM/AAAA)" value={bioquimica.novobiocina_validade || ''} onChangeText={t => updateBio('novobiocina_validade', t)} />
                            </View>
                            <TextInput style={styles.inputSmall} placeholder="Lote Ágar Muller Hinton" value={bioquimica.novobiocina_agar_lote || ''} onChangeText={t => updateBio('novobiocina_agar_lote', t)} />
                        </View>
                    )}

                    {gram.resultado === 'negativo' && (
                        <View style={styles.box}>
                            <Text style={[styles.subTitle, {color:'#F44336'}]}>Bioquímica (Gram -)</Text>
                            
                            {/* GRAM NEGATIVO - Ágar MacConkey */}
                            <Text style={styles.sectionHeader}>1. Ágar MacConkey</Text>
                            <TextInput style={styles.input} placeholder="Resultado (Lac+/-)" value={bioquimica.macconkey_resultado || ''} onChangeText={t => updateBio('macconkey_resultado', t)} />
                            
                            {/* EPM */}
                            <Text style={styles.sectionHeader}>2. EPM</Text>
                            <TextInput style={styles.inputSmall} placeholder="Produção de gás" value={bioquimica.epm_gas || ''} onChangeText={t => updateBio('epm_gas', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Produção de H2S" value={bioquimica.epm_h2s || ''} onChangeText={t => updateBio('epm_h2s', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Hidrólise da uréia" value={bioquimica.epm_ureia || ''} onChangeText={t => updateBio('epm_ureia', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Desaminação do Triptofano" value={bioquimica.epm_triptofano || ''} onChangeText={t => updateBio('epm_triptofano', t)} />
                            <View style={styles.rowInput}>
                                <TextInput style={[styles.inputSmall, {flex:1, marginRight:5}]} placeholder="Lote do EPM" value={bioquimica.epm_lote || ''} onChangeText={t => updateBio('epm_lote', t)} />
                                <TextInput style={[styles.inputSmall, {flex:1}]} placeholder="Validade (DD/MM/AAAA)" value={bioquimica.epm_validade || ''} onChangeText={t => updateBio('epm_validade', t)} />
                            </View>

                            {/* MILI */}
                            <Text style={styles.sectionHeader}>3. MILI</Text>
                            <TextInput style={styles.inputSmall} placeholder="Produção de INDOL" value={bioquimica.mili_indol || ''} onChangeText={t => updateBio('mili_indol', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Desaminação da Lisina" value={bioquimica.mili_lisina || ''} onChangeText={t => updateBio('mili_lisina', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Motilidade" value={bioquimica.mili_motilidade || ''} onChangeText={t => updateBio('mili_motilidade', t)} />
                            <TextInput style={styles.inputSmall} placeholder="Lote do MILI" value={bioquimica.mili_lote || ''} onChangeText={t => updateBio('mili_lote', t)} />

                            {/* CITRATO */}
                            <Text style={styles.sectionHeader}>4. Citrato</Text>
                            <TextInput style={styles.inputSmall} placeholder="Utilização do citrato (Fonte Carbono)" value={bioquimica.citrato_carbono || ''} onChangeText={t => updateBio('citrato_carbono', t)} />
                            <View style={styles.rowInput}>
                                <TextInput style={[styles.inputSmall, {flex:1, marginRight:5}]} placeholder="Lote do Citrato" value={bioquimica.citrato_lote || ''} onChangeText={t => updateBio('citrato_lote', t)} />
                                <TextInput style={[styles.inputSmall, {flex:1}]} placeholder="Validade (DD/MM/AAAA)" value={bioquimica.citrato_validade || ''} onChangeText={t => updateBio('citrato_validade', t)} />
                            </View>
                        </View>
                    )}

                    {/* 6. FINAL */}
                    <Text style={styles.label}>Laudo Final / Bactéria Identificada:</Text>
                    <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline value={resultadoFinal} onChangeText={setResultadoFinal} />

                    <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar} disabled={loading}>
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{color:'white', fontWeight:'bold'}}>
                            {isEditing ? "SALVAR ALTERAÇÕES" : "SALVAR EXAME"}
                        </Text>}
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F3F4F6' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    label: { fontWeight: 'bold', marginBottom: 5, color: '#555' },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
    inputSmall: { borderWidth: 1, borderColor: '#EEE', borderRadius: 6, padding: 10, marginBottom: 10, backgroundColor: '#FFF', fontSize: 14 },
    btnOpt: { flex: 1, padding: 15, backgroundColor: '#E5E7EB', alignItems: 'center', marginHorizontal: 5, borderRadius: 8 },
    btnSel: { backgroundColor: '#2563EB' },
    txtOpt: { fontWeight: 'bold', color: '#374151' },
    txtSel: { color: 'white' },
    box: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
    subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2563EB' },
    sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5 },
    rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
    btnSmall: { padding: 12, borderRadius: 8, backgroundColor: '#CCC', minWidth: 120, alignItems: 'center' },
    btnSalvar: { backgroundColor: '#10B981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 50 },
    badgeEditando: { backgroundColor: '#FFF3CD', padding: 10, borderRadius: 5, marginBottom: 15, borderColor: '#FFEEBA', borderWidth: 1 }
});