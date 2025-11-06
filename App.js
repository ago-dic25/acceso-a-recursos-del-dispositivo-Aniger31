import React, { useState, useRef, useEffect } from "react";
import { 
  StyleSheet, Text, View, Button, Image, TextInput, 
  TouchableOpacity, Alert, Modal 
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export default function App() {
  // Estados de flujo
  const [screen, setScreen] = useState(1);
  const [photo, setPhoto] = useState(null);

  // Lógica existente
  const [contador, setContador] = useState(0);
  const [inputText, setInputText] = useState("");

  // Cámara
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState("back"); // 👈 NUEVO: tipo de cámara (frontal/trasera)

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    setModalVisible(true);
  }, []);

  // Permisos
  const handlePermissionRequest = async () => {
    const cameraStatus = await requestPermission();
    const galleryStatus = await requestMediaPermission();

    if (cameraStatus.granted && galleryStatus.granted) {
      setModalVisible(false);
      setScreen(2);
    } else {
      Alert.alert("Permisos requeridos", "No se otorgaron permisos necesarios");
    }
  };

  // Cambiar cámara
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Tomar foto
  const takePhoto = async () => {
    if (cameraRef.current) {
      const picture = await cameraRef.current.takePictureAsync();
      setPhoto(picture.uri);
      setScreen(3);
    }
  };

  // Guardar o descartar
  const savePhoto = async () => {
    if (photo) {
      await MediaLibrary.saveToLibraryAsync(photo);
      Alert.alert("Éxito", "Foto guardada en la galería");
      setPhoto(null);
      setScreen(2);
    }
  };
  const discardPhoto = () => {
    setPhoto(null);
    setScreen(2);
  };

  // --- Pantalla 1: permisos ---
  if (screen === 1) {
    return (
      <View style={styles.container}>
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.title}>Permisos de cámara y galería</Text>
              <Text style={styles.text}>
                Necesitamos tu permiso para usar la cámara y guardar fotos.
              </Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.btnOK} onPress={handlePermissionRequest}>
                  <Text style={styles.btnText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Text style={styles.title}>Mi App con Cámara 📸</Text>

        <TextInput
          style={styles.input}
          placeholder="Escribe algo..."
          value={inputText}
          onChangeText={setInputText}
        />
        <Text style={styles.text}>Texto: {inputText}</Text>

        <Button title={`Contador: ${contador}`} onPress={() => setContador(contador + 1)} />
      </View>
    );
  }

  // --- Pantalla 2: cámara ---
  if (screen === 2) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.cameraControls}>
            <View style={styles.row}>
              <TouchableOpacity style={styles.btnSmall} onPress={toggleCameraFacing}>
                <Text style={styles.btnText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <Text style={styles.btnText}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // --- Pantalla 3: previsualización ---
  if (screen === 3) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.row}>
          <TouchableOpacity style={styles.btnOK} onPress={savePhoto}>
            <Text style={styles.btnText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={discardPhoto}>
            <Text style={styles.btnText}>Descartar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    width: "80%",
  },
  camera: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
  },
  cameraControls: {
    alignItems: "center",
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: "#00bfff",
    padding: 15,
    borderRadius: 50,
  },
  btnSmall: {
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 50,
  },
  preview: {
    width: "90%",
    height: "70%",
    borderRadius: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  btnOK: {
    backgroundColor: "#00bfff",
    padding: 12,
    borderRadius: 10,
  },
  btnCancel: {
    backgroundColor: "#ff4444",
    padding: 12,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#222",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    width: "80%",
  },
});
