import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// ⚠️ Ajuste para seu IP
const API_PACIENTES_URL = "http://localhost:3001/api/pacientes"; 

const PacientesScreen = ({ navigation }) => { 
  const [pacientes, setPacientes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [novoPaciente, setNovoPaciente] = useState({ 
      nome: "", 
      idade: "", 
      telefone: "", 
      data_nascimento: "", 
      nome_mae: "",        
      data_coleta: "",     
      sangue: ""           
  }); 

  // --- FUNÇÃO DE CÁLCULO DE IDADE ---
  const calcularIdade = (dataString) => {
      // Espera formato DD/MM/AAAA
      if (!dataString || dataString.length !== 10) return "";

      const partes = dataString.split('/');
      if (partes.length !== 3) return "";

      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const ano = parseInt(partes[2], 10);

      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return "";

      const hoje = new Date();
      let idadeCalculada = hoje.getFullYear() - ano;
      const m = hoje.getMonth() + 1 - mes;

      if (m < 0 || (m === 0 && hoje.getDate() < dia)) {
          idadeCalculada--;
      }

      return idadeCalculada >= 0 ? idadeCalculada.toString() : "0";
  };

  // Função que atualiza a data e calcula a idade automaticamente
  const handleChangeDataNascimento = (texto) => {
      // Atualiza o campo de data
      let idadeAtualizada = novoPaciente.idade;
      
      // Se a data estiver completa (10 caracteres: 01/01/2000), calcula
      if (texto.length === 10) {
          const idadeAuto = calcularIdade(texto);
          if (idadeAuto !== "") {
              idadeAtualizada = idadeAuto;
          }
      }

      setNovoPaciente({ 
          ...novoPaciente, 
          data_nascimento: texto,
          idade: idadeAtualizada
      });
  };

  const resetForm = () => {
      setNovoPaciente({ nome: "", idade: "", telefone: "", data_nascimento: "", nome_mae: "", data_coleta: "", sangue: "" });
      setEditandoId(null);
      setMostrarFormulario(false);
  };

  const toggleFormulario = () => {
      if (mostrarFormulario) {
          resetForm(); 
      } else {
          setMostrarFormulario(true);
      }
  };

  const mostrarAlerta = (titulo, mensagem) => {
      if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensagem}`);
      else Alert.alert(titulo, mensagem);
  };

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { navigation.navigate('Home'); return; }

      const response = await fetch(API_PACIENTES_URL, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPacientes(data); 
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchPacientes(); }, []); 

  const handleSalvarPaciente = async () => {
    if (!novoPaciente.nome || !novoPaciente.data_nascimento) {
        mostrarAlerta("Atenção", "Nome e Data de Nascimento são obrigatórios.");
        return;
    }

    const token = await AsyncStorage.getItem('userToken');
    
    const pacienteData = {
      nome: novoPaciente.nome,
      idade: parseInt(novoPaciente.idade) || 0, 
      telefone: novoPaciente.telefone,
      data_nascimento: novoPaciente.data_nascimento,
      nome_mae: novoPaciente.nome_mae,
      data_coleta: novoPaciente.data_coleta,
      sangue: novoPaciente.sangue
    };

    try {
      const url = editandoId ? `${API_PACIENTES_URL}/${editandoId}` : API_PACIENTES_URL;
      const method = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(pacienteData),
      });

      if (response.ok) {
        const pacienteSalvo = await response.json();
        
        if (editandoId) {
            setPacientes(pacientes.map(p => p.id === editandoId ? pacienteSalvo : p));
            mostrarAlerta("Sucesso", "Paciente atualizado!");
        } else {
            setPacientes([pacienteSalvo, ...pacientes]); 
            mostrarAlerta("Sucesso", "Paciente cadastrado!");
        }
        resetForm();
      } else {
        mostrarAlerta("Erro", "Falha ao salvar.");
      }
    } catch (error) {
      mostrarAlerta("Erro", "Erro de conexão.");
    }
  };

  const handleEditar = (paciente) => {
      setNovoPaciente({
          nome: paciente.nome,
          idade: paciente.idade ? paciente.idade.toString() : "",
          telefone: paciente.telefone || "",
          data_nascimento: paciente.data_nascimento || "",
          nome_mae: paciente.nome_mae || "",
          data_coleta: paciente.data_coleta || "",
          sangue: paciente.sangue || ""
      });
      setEditandoId(paciente.id);
      setMostrarFormulario(true);
  };

  const handleExcluir = (id) => {
      const executar = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await fetch(`${API_PACIENTES_URL}/${id}`, { method: 'DELETE', headers: {'Authorization': `Bearer ${token}`} });
            setPacientes(pacientes.filter(p => p.id !== id));
            mostrarAlerta("Sucesso", "Excluído.");
        } catch (e) { mostrarAlerta("Erro", "Não foi possível excluir."); }
      };

      if (Platform.OS === 'web') {
          if(window.confirm("Excluir paciente?")) executar();
      } else {
          Alert.alert("Excluir", "Confirma?", [{ text: "Cancelar" }, { text: "Sim", onPress: executar }]);
      }
  };
    
  const renderPaciente = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <MaterialCommunityIcons name="account-circle" size={50} color="#2E86FF" style={styles.avatar} />
        
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nome}</Text>
          <View style={styles.row}><Text style={styles.labelCard}>Nasc:</Text><Text style={styles.detalhe}>{item.data_nascimento} ({item.idade} anos)</Text></View>
          <View style={styles.row}><Text style={styles.labelCard}>Mãe:</Text><Text style={styles.detalhe}>{item.nome_mae || '-'}</Text></View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.btnExame}
            onPress={() => navigation.navigate('RealizarExame', { pacienteId: item.id, pacienteNome: item.nome })}
          >
            <Text style={styles.textBtnExame}>Iniciar Exame</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleEditar(item)} style={styles.iconBtn}>
              <Ionicons name="pencil" size={24} color="#FBC02D" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleExcluir(item.id)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={[styles.btnNovo, editandoId ? {backgroundColor:'#FBC02D'} : {}]} 
        onPress={toggleFormulario}
      >
        <Text style={styles.textBtnNovo}>
            {mostrarFormulario ? "Cancelar" : (editandoId ? "Cancelar Edição" : "+ Cadastrar Novo Paciente")}
        </Text>
      </TouchableOpacity>

      {mostrarFormulario && (
        <View style={styles.cardFormulario}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{editandoId ? "Editar Paciente" : "Novo Paciente"}</Text>
            <Text style={styles.cardDescription}>Preencha os dados completos</Text>
          </View>
          <View style={styles.cardContent}>
            
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput style={styles.input} value={novoPaciente.nome} onChangeText={t => setNovoPaciente({...novoPaciente, nome: t})} placeholder="Ex: João da Silva" />
            
            <Text style={styles.label}>Nome da Mãe</Text>
            <TextInput style={styles.input} value={novoPaciente.nome_mae} onChangeText={t => setNovoPaciente({...novoPaciente, nome_mae: t})} placeholder="Ex: Maria da Silva" />

            <View style={styles.rowInput}>
                <View style={{flex: 1, marginRight: 5}}>
                    <Text style={styles.label}>Nascimento (DD/MM/AAAA)</Text>
                    {/* 📌 AQUI ESTÁ A MÁGICA DO CÁLCULO */}
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ex: 20/05/1990" 
                        value={novoPaciente.data_nascimento} 
                        onChangeText={handleChangeDataNascimento} 
                        maxLength={10}
                    />
                </View>
                <View style={{flex: 1, marginLeft: 5}}>
                    <Text style={styles.label}>Idade (Automático)</Text>
                    {/* 📌 CAMPO TRAVADO (READ ONLY) */}
                    <TextInput 
                        style={[styles.input, {backgroundColor: '#E0E0E0', color: '#555'}]} 
                        value={novoPaciente.idade ? String(novoPaciente.idade) : ''} 
                        editable={false} // Usuário não digita, o sistema calcula
                    />
                </View>
            </View>

            <View style={styles.rowInput}>
                <View style={{flex: 1, marginRight: 5}}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput style={styles.input} keyboardType="phone-pad" value={novoPaciente.telefone} onChangeText={t => setNovoPaciente({...novoPaciente, telefone: t})} placeholder="(XX) 9XXXX-XXXX" />
                </View>
                <View style={{flex: 1, marginLeft: 5}}>
                    <Text style={styles.label}>Tipo Sanguíneo</Text>
                    <TextInput style={styles.input} placeholder="Ex: O+" value={novoPaciente.sangue} onChangeText={t => setNovoPaciente({...novoPaciente, sangue: t})} />
                </View>
            </View>

            <Text style={styles.label}>Data da Coleta</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={novoPaciente.data_coleta} onChangeText={t => setNovoPaciente({...novoPaciente, data_coleta: t})} />

            <View style={styles.botoesFormulario}>
              <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvarPaciente}>
                <Text style={styles.textBtnSalvar}>{editandoId ? "Salvar Alterações" : "Cadastrar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.titulo}>Pacientes Cadastrados ({pacientes.length})</Text>
      {loading ? <ActivityIndicator size="large" color="#2E86FF" style={{ marginTop: 20 }} /> : (
        <FlatList data={pacientes} keyExtractor={item => item.id.toString()} renderItem={renderPaciente} scrollEnabled={false} />
      )}
    </ScrollView>
  );
};

export default PacientesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F3FF", padding: 16 },
  btnNovo: { backgroundColor: "#2E86FF", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  textBtnNovo: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cardFormulario: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#0C4A6E" },
  cardDescription: { fontSize: 14, color: "#334155" },
  label: { fontSize: 14, fontWeight: "500", color: "#1E293B", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, padding: 10, backgroundColor: "#F8FAFC", marginBottom: 12 },
  rowInput: { flexDirection: 'row', justifyContent: 'space-between' },
  botoesFormulario: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btnSalvar: { flex: 1, backgroundColor: "#0EA5E9", padding: 12, borderRadius: 8, alignItems: "center" },
  textBtnSalvar: { color: "#FFF", fontWeight: "600" },
  titulo: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, flexDirection: "column", marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  avatar: { marginRight: 15 },
  info: { flex: 1 },
  nome: { fontSize: 17, fontWeight: "bold", marginBottom: 8, color: '#333' },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  labelCard: { fontWeight: 'bold', color: '#555', marginRight: 5, fontSize: 13 },
  detalhe: { fontSize: 13, color: "#666" },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  btnExame: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 10 },
  textBtnExame: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  iconBtn: { padding: 5 }
});