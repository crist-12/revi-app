
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LogBox,
  Image,
  TouchableOpacity,
  Modal
} from 'react-native';
import { ProgressStep, ProgressSteps } from 'react-native-progress-steps';
import ModalSelector from 'react-native-modal-selector-searchable'
import ButtonToggleGroup from 'react-native-button-toggle-group';
import useState from 'react-usestateref'
import * as ImagePicker from 'expo-image-picker'
import Swiper from 'react-native-swiper'
import Fontisto from 'react-native-vector-icons/Fontisto'
import ImageView from "react-native-image-viewing";
import AnimatedLoader from "react-native-animated-loader";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log("Estoy en la tarea programada :)")
  return BackgroundFetch.BackgroundFetchResult.NewData;
})

const registerBackgroundFetchAsync = async () => {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 1,
    stopOnTerminate: true,
    startOnBoot: false
  })
}

const unregisterBackgroundFetchAsync = async () => {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

const HomeScreen = ({ navigation }) => {

  const [users, setUsers] = React.useState([]); // Carga todos los conductores
  const [valueToggle, setValueToggle] = React.useState(); // Almacena el valor del valor del tanque de combustible
  const [vehicles, setVehicle] = React.useState([]); // Carga los vehículos registrados en el sistema
  const [selectedVehicle, setSelectedVehicle] = React.useState([]) // Almacena los datos del vehículo seleccionado
  const [driver, setDriver] = React.useState([]); // Almacena los datos del conductor seleccionado
  const [isLoading, setIsLoading] = React.useState(true); // Banderita que indica si se está o no cargando algún proceso
  const [quantityRows, setQuantityRows] = React.useState();
  const [nextValue, setNextValue] = React.useState(); // Almacena el valor del siguiente cambio de aceite
  const [kmActual, setKmActual] = React.useState(); // Almacena el valor del kilometraje actual de 
  const [groupsOptions, setGroupsOptions, groupOptionsRef] = useState(); // Almacena el valor de los grupos a evaluar
  const [respuestasQ, setRespuestasQ, respuestasRefQ] = useState([[], [], []]); // Almacena los valores de las respuestas de cada item
  const [interLength, setInterLength, interLengthRef] = useState(0)
  const [lengthArr, setLengthArr, lengthArrRef] = useState(0);
  const [photo, setPhoto, photoRef] = useState([]) // Almacena el valor de las fotografías
  const [auxphoto, setAuxPhoto, auxRef] = useState([]) // Almacena el valor de las fotografías opcionales
  const [obsTanque, setObsTanque] = React.useState(null) // Almacena el valor del input sobre las observaciones del tanque de gasolina
  const [insertedId, setInsertedId, insertedIdRef] = useState(null) // Almacena el id insertado en la base de datos de la tabla maestra
  const [loader, setLoader] = React.useState(false) // Controla la visibilidad del loader
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [status, setStatus] = React.useState(null);

  const [visible1, setIsVisible1] = React.useState(false); // Controla el ImageViewer en la primera imagen
  const [visible2, setIsVisible2] = React.useState(false); // Controla el ImageViewer en la segunda imagen
  const [visible3, setIsVisible3] = React.useState(false); // Controla el ImageViewer en la tercera imagen
  const [visible4, setIsVisible4] = React.useState(false); // Controla el ImageViewer en la cuarta imagen
  const [visible5, setIsVisible5] = React.useState(false); // Controla el ImageViewer en la quinta imagen
  let insertedIdValue;
  let celda;



  var flag = false;

  const [error, setError] = useState(true) // DEBO CAMBIARLO A TRUE DESPUES


  // Funcion que obtiene los datos de los usuarios para llenarse en el dropdown
  const getDropDownData = async () => {
    try {
      const response = await fetch("http://192.168.1.134:3000/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  }

  // Función que obtiene los datos de todos los vehículos
  const getAllVehicles = async () => {
    try {
      const response = await fetch("http://192.168.1.134:3000/vehiculos");
      const data = await response.json();
      setVehicle(data);
    } catch (error) {
      console.log(error);
    }
  }

  // Función que obtiene un objeto con todos los grupos y opciones a evaluar
  const getGroupAndOptions = async () => {
    try {
      const response = await fetch("http://192.168.1.134:3000/groups");
      const data = await response.json();
      setGroupsOptions(data);
    } catch (error) {
      console.log(error)
    }
  }

  // Función que comprueba si la asignación ya existe
  const doesAssignmentExist = async () => {
    try {
      const response = await fetch("http://192.168.1.134:3000/vehiculos/" + new URLSearchParams({
        userId: driver.key,
        vehCode: selectedVehicle.key
      }));
      const data = await response.json();
      if (data[0].Cantidad == 0) flag = true; else flag = false;
      setQuantityRows(data);
    } catch (error) {
      console.log(error)
    }
  }

  // Hook de Efecto para solicitar permiso para acceder a la cámara y a la galería a la aplicación
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Necesitas darle acceso a la cámara a esta aplicación.');
        }
      }
    })();
  }, []);

  // Hook de Efecto para carga de los datos previos a mostrarse en la pantalla
  useEffect(() => {
    getGroupAndOptions();
    getDropDownData();
    getAllVehicles();

    //console.log(users)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    checkStatusAsync();
  }, []);

  const checkStatusAsync = async () => {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    setStatus(status);
    setIsRegistered(isRegistered);
  };

  const toggleFetchTask = async () => {
    if (isRegistered) {
      await unregisterBackgroundFetchAsync();
    } else {
      await registerBackgroundFetchAsync();
    }

    checkStatusAsync();
  };

  // Función que almacena los valores seleccionados en el dropdown, recibe un parámetro de tipo string para diferenciar qué es lo que queremos guardar
  const handlerItem = async (option, type) => {
    if (type == "driver") {
      setDriver(option);
    } else {
      setSelectedVehicle(option);
    }
  }

  // Validar si el STEP 1 - DATOS GENERALES cumple con las validaciones y nos permite proseguir a la siguiente página
  const handleStepDG = async () => {
    await doesAssignmentExist();
    if (!flag && driver.key && selectedVehicle.key) {
      alert("Esta asignación ya existe")
      setError(true);
      return
    }
    if (driver.key && selectedVehicle.key) {
      setError(false);
    }
    else {
      alert("Asegúrate de seleccionar un vehículo y un conductor antes de proseguir")
      setError(true);
    }
  }

  // Validar si el STEP 2 - ESTADO GENERAL cumple con las validaciones y nos permite proseguir a la siguiente página
  const handleStepEG = async () => {
    if (kmActual && nextValue) {
      setError(false);
    } else {
      setError(true)
      if (!nextValue) return alert("El valor del próximo cambio es requerido");
      if (!kmActual) return alert("El valor del kilometraje actual es requerido");
    }
  }

  // Validar si el STEP 3 - REVISIÓN INTERIOR se ha elegido a todos los items
  const handleStepINT = async () => {

    var tamArray = 0;
    groupOptionsRef.current.filter(x => x.IdGrupoRecurso == "ASI_DET_INTERIOR").map(item => {
      tamArray = item.opciones.length;
      setInterLength(tamArray);
    })

    console.log("Todo -" + interLengthRef.current)
    console.log("INT -" + respuestasQ[0].length)
    if (respuestasQ[0].length != interLengthRef.current) {
      setError(true)
      return alert("Asegúrate de haber calificado todos los ítems antes de continuar")
    } else {
      setError(false)
    }
  }

  // Validar si el STEP 4 - REVISIÓN EXTERIORES Y MOTOR se han elegido todos los items
  const handleStepEXTMTR = () => {
    var tamArray = 0;
    var totalRes = 0;
    groupOptionsRef.current.filter(x => x.IdGrupoRecurso == "ASI_DET_EXTERIOR" || x.IdGrupoRecurso == "ASI_DET_MOTOR" || x.IdGrupoRecurso == "ASI_DET_INTERIOR").map(item => {
      tamArray += item.opciones.length
    })

    console.log(tamArray)
    respuestasQ.forEach((item) => {
      totalRes += item.length;
    })
    console.log(totalRes)

    if (totalRes != tamArray) {
      setError(true)
      return alert("Asegúrate de haber calificado todos los ítems antes de continuar")
    } else {
      setError(false)
    }
  }

  const handleStepOBS = () => {
    if (photo.length < 5) {
      setError(true)
      return alert("Debes adjuntar las fotografías antes de proceder")
    } else {
      setError(false)
    }
  }

  // Función que controla la subida de las fotografías
  const handleUploadPhoto = async () => {
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(photoRef.current)
      }

      const response = await fetch("http://192.168.1.134:3000/saveimages/" + new URLSearchParams({
        id: 1
      }), options);
      const data = await response.json();
      console.log(data);

    } catch (error) {
      alert(error)
      console.log(error);
    }
  }

  // Función que controla la funcionalidad de escoger una imagen ya sea de la cámara o de la galería
  const pickImage = async (code, type) => {
    let result;
    if (type == "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        base64: true,
        quality: 1,
      });
    } else if (type == "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        base64: true,
        quality: 1,
      });
    }

    console.log(code)
    console.log(type)
    if (code != 5) {
      if (!result.cancelled) {
        let newArr = [...photo];
        newArr[code] = result.base64
        setPhoto(newArr);
      }
    } else {
      if (!result.cancelled) {
        let newArr = [...auxphoto];

        newArr.push(result.base64)
        setAuxPhoto(newArr)

        let auxArr = [...photo];
        auxArr.splice(5, 1, newArr)
        setPhoto(auxArr);
        console.log("newarray mide " + newArr.length)
      }
    }

  };


  const handleSaveAssignment = async () => {
    const assignment = {
      CodigoUsuario: driver.key,
      CodigoVehiculo: selectedVehicle.key,
      KilometrajeRecibido: kmActual,
      ProximoCambio: nextValue,
      TanqueCombustible: valueToggle,
      ObservacionesTanqueCombustible: obsTanque
    }

    const response1 = await fetch("http://192.168.1.134:3000/assignment", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assignment)
    })

    const data = await response1.json()
    setInsertedId(data.insertId)
    insertedIdValue = data.insertId;
  }

  // Ignora los warnings en la consola
  LogBox.ignoreAllLogs();

  const handleSaveAssignmentDetails = async () => {
    //console.log(respuestasQ[0][0])
    try {
      respuestasQ.forEach((item, index) => {
        item.forEach((respuesta, indice) => {
          let obj = {
            "IdAsignacion": insertedId,
            "CodigoGrupoRecurso": respuesta.CodigoGrupoRecurso,
            "CodigoOpcionRecurso": respuesta.CodigoOpcionRecurso,
            "Respuesta": respuesta.Respuesta
          }

          fetch("http://192.168.1.134:3000/details", {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              "Content-Type": "application/json",
            },
            body: JSON.stringify(obj)
          }).then((res) => {
            console.log("Detalle insertado exitosamente")
          }).catch((err) => {
            console.log(err)
          })

          console.log(obj)
        })
        // const data = await response1.json()
      })
    } catch (error) {
      alert(error)
    }
  }

  const handleSaveAllAsignments = async () => {
    setLoader(true)
    await handleSaveAssignment();
    await handleSaveAssignmentDetails();
    await handleUploadPhoto();
    setLoader(false)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-50}>
      <View style={styles.container}>

        <StatusBar barStyle="light-content" />

        {
          isLoading ?
            <>
              <Text>Estoy cargando</Text>
            </> :
            <>
              <View style={styles.header, { backgroundColor: 'white', flex: 1, width: '100%' }}>
                <View style={styles.header}>
                  <Text style={styles.title}>Asignación de Vehículos</Text>
                </View>
              </View>
              <View style={styles.body}>
                <View style={{ marginLeft: 20, marginRight: 20, flex: 1 }}>
                  <ProgressSteps>
                    <ProgressStep label="DG" errors={error} onNext={handleStepDG} nextBtnText="Siguiente">
                      <View style={styles.picker}>
                        <Text style={{ marginBottom: 5 }}>Seleccione un conductor: </Text>

                        <ModalSelector
                          data={users}
                          initValue={"Selecciona un conductor"}
                          supportedOrientations={['landscape']}
                          accessible={true}
                          keyExtractor={item => item.key}
                          labelExtractor={item => item.label}
                          cancelText='Cancelar'
                          searchText='Buscar...'
                          searchStyle={{ height: 40, justifyContent: 'center' }}
                          onChange={(option) => { handlerItem(option, "driver") }}>

                          <TextInput
                            style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, height: 40 }}
                            editable={false}
                            placeholder="Selecciona un conductor"
                            value={driver.label} />
                        </ModalSelector>

                        <Text style={{ marginTop: 10, marginBottom: 5 }}>Seleccione el carro a asignar</Text>
                        <ModalSelector
                          data={vehicles}
                          initValue={"Selecciona un vehículo"}
                          supportedOrientations={['landscape']}
                          accessible={true}
                          keyExtractor={item => item.key}
                          labelExtractor={item => item.label}
                          cancelText='Cancelar'
                          searchText='Buscar...'
                          searchStyle={{ height: 40, justifyContent: 'center' }}
                          onChange={(option) => { handlerItem(option) }}>

                          <TextInput
                            style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, height: 40 }}
                            editable={false}
                            placeholder="Selecciona un vehículo"
                            value={selectedVehicle.label} />
                        </ModalSelector>
                        <View style={styles.data}>
                          <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>DATOS GENERALES</Text>
                          <Text style={{ fontWeight: 'bold', marginTop: 15 }}>CONDUCTOR</Text>
                          {
                            driver.key ?
                              <>

                                <Text>NOMBRE: {driver.label}</Text>
                                <Text>SUCURSAL: {driver.NombreUbicacion}</Text>
                              </> :
                              <Text>No hay datos disponibles</Text>
                          }

                          <Text style={{ fontWeight: 'bold', marginTop: 15 }}>VEHÍCULO</Text>
                          {
                            selectedVehicle.key ?
                              <>
                                <Text>PLACA: {selectedVehicle.label}</Text>
                                <Text>MODELO: {selectedVehicle.VehMarca} {selectedVehicle.VehModelo}</Text>
                                <Text>AÑO: {selectedVehicle.VehAno}</Text>
                                <Text>TIPO DE COMBUSTIBLE: {selectedVehicle.VehTipoCombustible ?? ""}</Text>
                                <Text>KILOMETRAJE: {selectedVehicle.VehKilometraje}</Text>
                              </> :
                              <Text>No hay datos disponibles</Text>
                          }
                          <Text>
                            {status && BackgroundFetch.BackgroundFetchStatus[status]}
                          </Text>
                          <Text>
                            {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
                          </Text>
                          <Button
                            title={isRegistered ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
                            onPress={toggleFetchTask}
                          />
                        </View>
                      </View>
                    </ProgressStep>
                    <ProgressStep label="EG" nextBtnText="Siguiente" previousBtnText="Anterior" onNext={handleStepEG} errors={error}>
                      <View>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 15 }}>ESTADO GENERAL DEL VEHÍCULO</Text>
                        <View>
                          <Text>PRÓXIMO CAMBIO DE ACEITE:</Text>
                          <TextInput
                            placeholder='Fecha de próximo cambio'
                            value={nextValue}
                            onChangeText={(val) => setNextValue(val)}
                            style={styles.inputs} />
                          <Text>KILOMETRAJE ACTUAL:</Text>
                          <TextInput
                            placeholder='Kilometraje actual'
                            value={kmActual}
                            keyboardType='numeric'
                            onChangeText={(val) => setKmActual(val)}
                            style={styles.inputs} />
                          <Text style={{ marginBottom: 10 }}>ESTADO DEL TANQUE DE COMBUSTIBLE:</Text>
                          <ButtonToggleGroup
                            highlightBackgroundColor={'#00BEF0'}
                            highlightTextColor={'white'}
                            inactiveBackgroundColor={'transparent'}
                            inactiveTextColor={'grey'}
                            values={['E', '1/4', '1/2', '3/4', 'F']}
                            value={valueToggle}
                            onSelect={val => setValueToggle(val)}
                          />
                          <Text style={{ marginTop: 15 }}>OBSERVACIONES:</Text>
                          <TextInput
                            multiline={true}
                            style={styles.inputs}
                            value={obsTanque}
                            onChangeText={(val) => setObsTanque(val)} />
                        </View>
                      </View>
                    </ProgressStep>
                    <ProgressStep label="INT" onNext={handleStepINT} nextBtnText="Siguiente" previousBtnText="Anterior" errors={error}>
                      <ScrollView>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 15 }}>DETALLES DEL VEHÍCULO</Text>
                        {
                          groupOptionsRef.current ?
                            groupOptionsRef.current.map((item, index) => {

                              return (

                                <ScrollView>
                                  {
                                    // setLengthArr(index)
                                  }
                                  {
                                    item.opciones.filter(x => x.IdGrupoRecurso == "ASI_DET_INTERIOR").map((item, index) => {

                                      return (
                                        <>
                                          {
                                            !index ? (
                                              <>
                                                <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 10 }} key={index}>{item.NombreGrupoRecurso}</Text>
                                              </>
                                            ) : <></>
                                          }
                                          <Text style={{ marginTop: 15 }} key={index}>{item.NombreOpcionRecurso}</Text>
                                          <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginBottom: 5 }} />
                                          <ButtonToggleGroup
                                            highlightBackgroundColor={'#00BEF0'}
                                            highlightTextColor={'white'}
                                            inactiveBackgroundColor={'transparent'}
                                            inactiveTextColor={'grey'}
                                            values={['MALO', 'REGULAR', 'EXCELENTE']}
                                            value={respuestasQ[0][index]?.Respuesta ?? ""}
                                            onSelect={val => {
                                              var obj = {
                                                IdAsignacion: 1,
                                                CodigoVehiculo: selectedVehicle.key,
                                                CodigoUsuario: driver.key,
                                                CodigoGrupoRecurso: item.IdGrupoRecurso,
                                                CodigoOpcionRecurso: item.IdOpcionRecurso,
                                                Respuesta: val
                                              }
                                              var newArray = [...respuestasQ];
                                              newArray[0][index] = obj;
                                              setRespuestasQ(newArray)
                                              setLengthArr(newArray.length);
                                            }}

                                          />
                                        </>
                                      )
                                    })
                                  }
                                </ScrollView>
                              )
                            })
                            :
                            <Text>No data</Text>
                        }

                      </ScrollView>
                    </ProgressStep>
                    <ProgressStep label="EXT/MTR" nextBtnText="Siguiente" previousBtnText="Anterior" onNext={handleStepEXTMTR} errors={error}>
                      <ScrollView>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 15 }}>DETALLES DEL VEHÍCULO</Text>
                        {
                          groupOptionsRef.current ?
                            groupOptionsRef.current.map((item, indice) => {

                              return (
                                <ScrollView>
                                  {
                                    item.opciones.filter(x => x.IdGrupoRecurso == "ASI_DET_EXTERIOR").map((item, index) => {

                                      return (
                                        <>
                                          {
                                            !index ? (
                                              <>
                                                <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 10 }} key={index}>{item.NombreGrupoRecurso}</Text>
                                              </>
                                            ) : <></>


                                          }
                                          <Text style={{ marginTop: 15 }} key={index}>{item.NombreOpcionRecurso} </Text>
                                          <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginBottom: 5 }} />
                                          <ButtonToggleGroup
                                            highlightBackgroundColor={'#00BEF0'}
                                            highlightTextColor={'white'}
                                            inactiveBackgroundColor={'transparent'}
                                            inactiveTextColor={'grey'}
                                            values={['MALO', 'REGULAR', 'EXCELENTE']}
                                            value={respuestasQ[1]?.[index]?.Respuesta}
                                            onSelect={val => {
                                              var obj = {
                                                IdAsignacion: 1,
                                                CodigoVehiculo: selectedVehicle.key,
                                                CodigoUsuario: driver.key,
                                                CodigoGrupoRecurso: item.IdGrupoRecurso,
                                                CodigoOpcionRecurso: item.IdOpcionRecurso,
                                                Respuesta: val
                                              }
                                              var newArray = [...respuestasQ];

                                              newArray[1][index] = obj;
                                              setRespuestasQ(newArray)
                                            }}

                                          />
                                        </>
                                      )
                                    }

                                    )
                                  }
                                </ScrollView>
                              )
                            })
                            :
                            <Text>No data</Text>
                        }

                        {
                          groupOptionsRef.current ?
                            groupOptionsRef.current.map((item, indice) => {

                              return (
                                <ScrollView>
                                  {
                                    item.opciones.filter(x => x.IdGrupoRecurso == "ASI_DET_MOTOR").map((item, index) => {

                                      return (
                                        <>
                                          {
                                            !index ? (
                                              <>
                                                <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 10 }} key={index}>{item.NombreGrupoRecurso}</Text>
                                              </>
                                            ) : <></>


                                          }
                                          <Text style={{ marginTop: 15 }} key={index}>{item.NombreOpcionRecurso} </Text>
                                          <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginBottom: 5 }} />
                                          <ButtonToggleGroup
                                            highlightBackgroundColor={'#00BEF0'}
                                            highlightTextColor={'white'}
                                            inactiveBackgroundColor={'transparent'}
                                            inactiveTextColor={'grey'}
                                            values={['MALO', 'REGULAR', 'EXCELENTE']}
                                            value={respuestasQ[2]?.[index]?.Respuesta}
                                            onSelect={val => {
                                              var obj = {
                                                IdAsignacion: 1,
                                                CodigoVehiculo: selectedVehicle.key,
                                                CodigoUsuario: driver.key,
                                                CodigoGrupoRecurso: item.IdGrupoRecurso,
                                                CodigoOpcionRecurso: item.IdOpcionRecurso,
                                                Respuesta: val
                                              }
                                              var newArray = [...respuestasQ];

                                              newArray[2][index] = obj;
                                              setRespuestasQ(newArray)
                                            }}

                                          />
                                        </>
                                      )
                                    }

                                    )
                                  }
                                </ScrollView>
                              )
                            })
                            :
                            <Text>No data</Text>
                        }

                      </ScrollView>
                    </ProgressStep>
                    <ProgressStep label="OBS" nextBtnText="Siguiente" previousBtnText="Anterior" onNext={handleStepOBS} errors={error}>
                      <View style={{ flex: 1 }}>
                        {/* 
              <Button title="Choose Photo" onPress={pickImage} />
              <Button title="Upload Photo" onPress={handleUploadPhoto} /> */}
                        <ScrollView style={{ flex: 1 }}>
                          <Swiper showsButtons={true} height={400}>
                            <View style={styles.slide1}>
                              <Text style={styles.text}>Foto Delantera</Text>
                              <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'white' }}>
                                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => pickImage(0, 'camera')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="camera" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Tomar fotografía</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(0, 'gallery')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="photograph" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Subir desde galería</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View style={styles.picview}>
                                <View style={styles.borderview}>
                                  <TouchableOpacity onPress={() => setIsVisible1(true)} activeOpacity={0.5}>
                                    <Image style={{
                                      width: 248,
                                      height: 198,
                                    }}
                                      source={{
                                        uri: "data:image/png;base64," + photoRef.current[0]
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <ImageView
                                    images={[
                                      { uri: "data:image/png;base64," + photoRef.current[0] }
                                    ]}
                                    presentationStyle="overFullScreen"
                                    imageIndex={0}
                                    visible={visible1}
                                    onRequestClose={() => setIsVisible1(false)}
                                  />
                                </View>
                              </View>
                            </View>
                            <View style={styles.slide2}>
                              <Text style={styles.text}>Foto Trasera</Text>
                              <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'white' }}>
                                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => pickImage(1, 'camera')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="camera" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Tomar fotografía</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(1, 'gallery')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="photograph" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Subir desde galería</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View style={styles.picview}>
                                <View style={styles.borderview}>
                                  <TouchableOpacity onPress={() => setIsVisible2(true)} activeOpacity={0.5}>
                                    <Image style={{
                                      width: 248,
                                      height: 198,
                                    }}
                                      source={{
                                        uri: "data:image/png;base64," + photoRef.current[1]
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <ImageView
                                    images={[
                                      { uri: "data:image/png;base64," + photoRef.current[1] }
                                    ]}
                                    presentationStyle="overFullScreen"
                                    imageIndex={0}
                                    visible={visible2}
                                    onRequestClose={() => setIsVisible2(false)}
                                  />
                                </View>
                              </View>
                            </View>
                            <View style={styles.slide3}>
                              <Text style={styles.text}>Foto lateral izquierda</Text>
                              <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'white' }}>
                                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => pickImage(2, 'camera')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="camera" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Tomar fotografía</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(2, 'gallery')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="photograph" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Subir desde galería</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View style={styles.picview}>
                                <View style={styles.borderview}>
                                  <TouchableOpacity onPress={() => setIsVisible3(true)} activeOpacity={0.5}>
                                    <Image style={{
                                      width: 248,
                                      height: 198,
                                    }}
                                      source={{
                                        uri: "data:image/png;base64," + photoRef.current[2]
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <ImageView
                                    images={[
                                      { uri: "data:image/png;base64," + photoRef.current[2] }
                                    ]}
                                    presentationStyle="overFullScreen"
                                    imageIndex={0}
                                    visible={visible3}
                                    onRequestClose={() => setIsVisible3(false)}
                                  />
                                </View>
                              </View>
                            </View>
                            <View style={styles.slide4}>
                              <Text style={styles.text}>Foto lateral derecha</Text>
                              <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'white' }}>
                                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => pickImage(3, 'camera')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="camera" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Tomar fotografía</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(3, 'gallery')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="photograph" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Subir desde galería</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View style={styles.picview}>
                                <View style={styles.borderview}>
                                  <TouchableOpacity onPress={() => setIsVisible4(true)} activeOpacity={0.5}>
                                    <Image style={{
                                      width: 248,
                                      height: 198,
                                    }}
                                      source={{
                                        uri: "data:image/png;base64," + photoRef.current[3]
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <ImageView
                                    images={[
                                      { uri: "data:image/png;base64," + photoRef.current[3] }
                                    ]}
                                    presentationStyle="overFullScreen"
                                    imageIndex={0}
                                    visible={visible4}
                                    onRequestClose={() => setIsVisible4(false)}
                                  />
                                </View>
                              </View>
                            </View>
                            <View style={styles.slide5}>
                              <Text style={styles.text}>Foto interior</Text>
                              <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'white' }}>
                                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => pickImage(4, 'camera')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="camera" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Tomar fotografía</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(4, 'gallery')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="photograph" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Subir desde galería</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View style={styles.picview}>
                                <View style={styles.borderview}>
                                  <TouchableOpacity onPress={() => setIsVisible5(true)} activeOpacity={0.5}>
                                    <Image style={{
                                      width: 248,
                                      height: 198,
                                    }}
                                      source={{
                                        uri: "data:image/png;base64," + photoRef.current[4]
                                      }}
                                    />
                                  </TouchableOpacity>
                                  <ImageView
                                    images={[
                                      { uri: "data:image/png;base64," + photoRef.current[4] }
                                    ]}
                                    presentationStyle="overFullScreen"
                                    imageIndex={0}
                                    visible={visible5}
                                    onRequestClose={() => setIsVisible5(false)}
                                  />
                                </View>
                              </View>
                            </View>
                            <View style={styles.slide6}>
                              <Text style={styles.text}>Observaciones</Text>
                              <View style={{ flexDirection: 'row', marginTop: 15, backgroundColor: 'white' }}>
                                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => pickImage(5, 'camera')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="camera" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Tomar fotografía</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => pickImage(5, 'gallery')}>
                                  <View style={{ flexDirection: 'row', padding: 10, backgroundColor: 'white', borderRadius: 0 }}>
                                    <Fontisto name="photograph" size={20} color="darkgray" />
                                    <Text style={{ marginLeft: 5, color: 'darkgray' }}>Subir desde galería</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <ScrollView style={{ backgroundColor: 'white', width: '100%' }}>
                                <View style={{ flex: 1, justifyContent: 'center', margin: 10 }}>
                                  <Text>OBSERVACIONES:</Text>
                                  <TextInput multiline={true} style={styles.inputs} />
                                  <Text>Fotos adjuntadas: {auxRef.current.length}</Text>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                  {/*                                   <ImageView
                                    images={[
                                      { uri: "data:image/png;base64," + photoRef.current[4] }
                                    ]}
                                    presentationStyle="overFullScreen"
                                    imageIndex={0}
                                    visible={visible5}
                                    onRequestClose={() => setIsVisible5(false)}
                                  /> */}

                                  {
                                    auxRef.current.map((item) => {
                                      return (<View style={styles.borderview, { marginVertical: 10 }}>

                                        <Image style={{
                                          width: 248,
                                          height: 198,
                                        }}
                                          source={{
                                            uri: "data:image/png;base64," + item
                                          }}
                                        />

                                      </View>)
                                    })
                                  }
                                </View>
                              </ScrollView>
                            </View>
                          </Swiper>
                        </ScrollView>
                      </View>
                    </ProgressStep>
                    <ProgressStep label="EX" finishBtnText="Finalizar" previousBtnText="Anterior">
                      <View style={{ flex: 1 }}>
                        <AnimatedLoader
                          visible={loader}
                          overlayColor="rgba(255,255,255,0.75)"
                          source={require("../animation/loader.json")}
                          animationStyle={{ width: 300, height: 300 }}
                          speed={1}
                        >
                          <Text>Enviando respuestas...</Text>
                        </AnimatedLoader>
                        <Button title="Guardar Asignacion" onPress={handleSaveAssignment} />
                        <Button title="Guardar detalles" onPress={handleSaveAssignmentDetails} />
                        <Button title="Guardar" onPress={handleUploadPhoto} />
                        <Button title="Guardar asignación :)" onPress={handleSaveAllAsignments} />
                      </View>
                    </ProgressStep>
                  </ProgressSteps>
                </View>
              </View>

            </>
        }
      </View>
    </KeyboardAvoidingView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,190,240,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    backgroundColor: 'rgba(0,190,240,1)',
    width: '100%',
    justifyContent: 'center',
    borderBottomRightRadius: 120
  },
  body: {
    flex: 4,
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 120
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    margin: 15,
  },
  picker: {
    margin: 0
  },
  data: {
    marginTop: 20,
    borderColor: 'lightgray',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 5,
    width: '100%',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  inputs: {
    padding: 3,
    borderColor: 'lightgray',
    borderWidth: 1,
    marginVertical: 10
  },
  slide1: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 10,
    borderRadius: 20
  },

  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
    padding: 10,
    borderRadius: 20
  },

  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
    padding: 10,
    borderRadius: 20
  },

  slide4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7dd0ec',
    padding: 10,
    borderRadius: 20
  },

  slide5: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#71aee0',
    padding: 10,
    borderRadius: 20
  },

  slide6: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5aadff',
    padding: 10,
    borderRadius: 20
  },

  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold'
  },
  picview: {
    padding: 10,
    backgroundColor: 'white',
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  borderview: {
    width: 250,
    height: 200,
    borderRadius: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'lightgray'
  }
});
