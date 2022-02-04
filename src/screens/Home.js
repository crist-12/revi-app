
import React, { useEffect } from 'react';
import {
   StyleSheet, 
   Text, 
   View, 
   StatusBar, 
   TextInput, 
   KeyboardAvoidingView, 
   Platform, 
   ScrollView, 
   LogBox } from 'react-native';
import { ProgressStep, ProgressSteps } from 'react-native-progress-steps';
import ModalSelector from 'react-native-modal-selector-searchable'
import ButtonToggleGroup from 'react-native-button-toggle-group';
import useState from 'react-usestateref'


const HomeScreen = ({navigation}) => {

const [users, setUsers] = React.useState([]);
const [valueToggle, setValueToggle] = React.useState();
const [vehicles, setVehicle] = React.useState([]);
const [selectedVehicle, setSelectedVehicle] = React.useState([])
const [driver, setDriver] = React.useState([]);  
const [isLoading, setIsLoading] = React.useState(true);
const [quantityRows, setQuantityRows] = React.useState();
const [nextValue, setNextValue] = React.useState();
const [kmActual, setKmActual] = React.useState();
const [groupsOptions, setGroupsOptions, groupOptionsRef] = useState();
const [respuestasQ, setRespuestasQ, respuestasRefQ] = useState([]);
const [interLength, setInterLength, interLengthRef] = useState(0)
const [lengthArr, setLengthArr, lengthArrRef] = useState(0);
const [a ,sA, SAR] = useState(0)




var flag = false;

const [error, setError] = useState(false) // DEBO CAMBIARLO A TRUE DESPUES



const getDropDownData = async() => {
  try{
    const response = await fetch("http://192.168.1.134:3000/users");
    const data = await response.json();   
    setUsers(data);
  }catch(error){
      console.log(error);
  }
}

const getAllVehicles = async() => {
  try{
    const response = await fetch("http://192.168.1.134:3000/vehiculos");
    const data = await response.json();   
    setVehicle(data);
  }catch(error){
      console.log(error);
  }
}

const getGroupAndOptions = async() => {
  try{
    const response = await fetch("http://192.168.1.134:3000/groups");
    const data = await response.json();  
    setGroupsOptions(data);
  }catch(error){
    console.log(error)
  }
}


const doesAssignmentExist = async() => {
  try{
    const response = await fetch("http://192.168.1.134:3000/vehiculos/" + new URLSearchParams({
      userId : driver.key,
      vehCode : selectedVehicle.key
    }));
    const data = await response.json();   
    if(data[0].Cantidad == 0) flag = true; else flag = false;
    setQuantityRows(data);
  }catch(error){
    console.log(error)
  }
}

  useEffect(()=>{
    getGroupAndOptions();
    getDropDownData();
    getAllVehicles();

    //console.log(users)
    setIsLoading(false)
  }, [])


  const handlerItem = async(option, type) => {
    if(type == "driver"){
      setDriver(option);
    }else{
      setSelectedVehicle(option);
    }
  }

  const handleStepDG = async() => {
    await doesAssignmentExist();
    if(!flag && driver.key && selectedVehicle.key){
      alert("Esta asignación ya existe")
      setError(true);
      return
    }
    if (driver.key && selectedVehicle.key){
     setError(false);
    }
    else{
      alert("Asegúrate de seleccionar un vehículo y un conductor antes de proseguir")
      setError(true);
    } 
  }

  const handleStepEG = async()=> {
    if(kmActual && nextValue){
      setError(false);
    }else{
      setError(true)
      if(!nextValue) return alert("El valor del próximo cambio es requerido");
      if(!kmActual) return alert("El valor del kilometraje actual es requerido");
    }
  }

  const handleStepINT = async() => {

    var tamArray = 0;
    groupOptionsRef.current.filter(x => x.IdGrupoRecurso == "ASI_DET_INTERIOR").map(item => {
      tamArray = item.opciones.length;
      setInterLength(tamArray);
    })

    if(respuestasRefQ.current.length < interLengthRef.current){
      setError(true)
      return alert("Asegúrate de haber calificado todos los ítems antes de continuar")
    }else{
      setError(false)
    }
  }


  const handleStepEXTMTR = () => {
    var tamArray = 0;
    groupOptionsRef.current.filter(x => x.IdGrupoRecurso == "ASI_DET_EXTERIOR" || x.IdGrupoRecurso == "ASI_DET_MOTOR" || x.IdGrupoRecurso == "ASI_DET_INTERIOR").map(item => {
      tamArray = item.opciones.length;
    })

    if(respuestasRefQ.current.length != tamArray){
      setError(true)
      return alert("Asegúrate de haber calificado todos los ítems antes de continuar")
    }else{
      setError(false)
    }
  }

LogBox.ignoreAllLogs();

  return (

    <KeyboardAvoidingView 
    style = {{flex: 1}}
    behavior = {Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset = {-50}
>
    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
    <View style={styles.container}>

      <StatusBar barStyle="light-content"/>
     
      {
        isLoading ?
        <>
        <Text>Estoy cargando</Text>
        </> :
        <>
        <View style = {styles.header, {backgroundColor: 'white', flex: 1, width: '100%'}}>
        <View style={styles.header}>
        <Text style={styles.title}>Asignación de Vehículos</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={{marginLeft: 20, marginRight: 20, flex: 1}}>
        <ProgressSteps>
          <ProgressStep label="DG" errors={error} /*onNext = {handleStepDG}*/ nextBtnText = "Siguiente">
              <View style={styles.picker}>
              <Text style={{marginBottom: 5}}>Seleccione un conductor: </Text>

              <ModalSelector
                    data={users}
                    initValue={"Selecciona un conductor"}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    keyExtractor={item => item.key}
                    labelExtractor={item => item.label}
                    cancelText='Cancelar'
                    searchText='Buscar...'                   
                    searchStyle={{height: 40, justifyContent: 'center'}}
                    onChange={(option)=>{ handlerItem(option, "driver")}}>

                    <TextInput
                        style={{borderWidth:1, borderColor:'#ccc', padding:10, height:40}}
                        editable={false}
                        placeholder="Selecciona un conductor"
                        value={driver.label} />
                </ModalSelector>

                <Text style={{marginTop: 10, marginBottom: 5}}>Seleccione el carro a asignar</Text>
                <ModalSelector
                    data={vehicles}
                    initValue={"Selecciona un vehículo"}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    keyExtractor={item => item.key}
                    labelExtractor={item => item.label}
                    cancelText='Cancelar'
                    searchText='Buscar...'                   
                    searchStyle={{height: 40, justifyContent: 'center'}}
                    onChange={(option)=>{ handlerItem(option)}}>

                    <TextInput
                        style={{borderWidth:1, borderColor:'#ccc', padding:10, height:40}}
                        editable={false}
                        placeholder="Selecciona un vehículo"
                        value={selectedVehicle.label} />
                </ModalSelector>
                <View style={styles.data}>
                  <Text style={{textAlign: 'center', fontWeight: 'bold'}}>DATOS GENERALES</Text>
                  <Text style={{fontWeight: 'bold', marginTop: 15}}>CONDUCTOR</Text> 
                   {
                    driver.key ? 
                    <>

                    <Text>NOMBRE: {driver.label}</Text>
                    <Text>SUCURSAL: {driver.NombreUbicacion}</Text>
                    </>: 
                    <Text>No hay datos disponibles</Text>
                  }

                  <Text style={{fontWeight: 'bold', marginTop: 15}}>VEHÍCULO</Text> 
                  {
                    selectedVehicle.key ? 
                    <>
                    <Text>PLACA: {selectedVehicle.label}</Text>
                    <Text>MODELO: {selectedVehicle.VehMarca} {selectedVehicle.VehModelo}</Text>
                    <Text>AÑO: {selectedVehicle.VehAno}</Text>
                    <Text>TIPO DE COMBUSTIBLE: {selectedVehicle.VehTipoCombustible ?? ""}</Text>
                    <Text>KILOMETRAJE: {selectedVehicle.VehKilometraje}</Text>
                    </>: 
                    <Text>No hay datos disponibles</Text>
                  }

                </View>
              </View>
          </ProgressStep>
          <ProgressStep label="EG" nextBtnText="Siguiente" previousBtnText = "Anterior" /*onNext={handleStepEG}*/ errors={error}>
              <View>
                  <Text style={{textAlign: 'center', fontWeight: 'bold', marginBottom: 15}}>ESTADO GENERAL DEL VEHÍCULO</Text>
                  <View>
                  <Text>PRÓXIMO CAMBIO:</Text>
                    <TextInput
                    placeholder='Fecha de próximo cambio'
                     value = {nextValue}
                     onChangeText={(val)=> setNextValue(val)}
                     style={styles.inputs}/>
                    <Text>KILOMETRAJE ACTUAL:</Text>
                    <TextInput
                    placeholder='Kilometraje actual'
                    value={kmActual}
                    onChangeText={(val)=> setKmActual(val)}
                    style={styles.inputs}/>
                    <Text style={{marginBottom: 10}}>ESTADO DEL TANQUE DE COMBUSTIBLE:</Text>
                    <ButtonToggleGroup
                          highlightBackgroundColor={'#00BEF0'}
                          highlightTextColor={'white'}
                          inactiveBackgroundColor={'transparent'}
                          inactiveTextColor={'grey'}
                          values={['E', '1/4', '1/2', '3/4', 'F']}
                          value={valueToggle}
                          onSelect={val => setValueToggle(val)}
                      />
                    <Text style={{marginTop: 15}}>OBSERVACIONES:</Text>
                    <TextInput multiline={true} style={styles.inputs}/>
                  </View>
              </View>
          </ProgressStep>
          <ProgressStep label="INT" onNext = {handleStepINT} nextBtnText="Siguiente" previousBtnText = "Anterior" errors={error}>
              <ScrollView>
              <Text style={{textAlign: 'center', fontWeight: 'bold', marginBottom: 15}}>DETALLES DEL VEHÍCULO</Text>
                  {
                    groupOptionsRef.current ?
                    groupOptionsRef.current.map((item, index)=> {

                      return (
                        
                        <ScrollView>
                        {
                         // setLengthArr(index)
                        }
                        {
                          item.opciones.filter(x => x.IdGrupoRecurso == "ASI_DET_INTERIOR").map((item, index)=> {
                          
                          return (
                          <>
                          {
                            !index ? (
                            <>
                            <Text style={{fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 10}} key={index}>{item.NombreGrupoRecurso}</Text> 
                            </>
                            ): <></>
                          }
                          <Text style={{marginTop: 15}} key={index}>{item.NombreOpcionRecurso}</Text>
                          <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginBottom: 5}}/>
                          <ButtonToggleGroup
                          highlightBackgroundColor={'#00BEF0'}
                          highlightTextColor={'white'}
                          inactiveBackgroundColor={'transparent'}
                          inactiveTextColor={'grey'}
                          values={['MALO', 'REGULAR', 'EXCELENTE']}
                          value = {respuestasQ[index]?.Respuesta}
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
                          newArray[index] = obj;
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
          <ProgressStep label="EXT/MTR" nextBtnText="Siguiente" previousBtnText = "Anterior" onNext={handleStepEXTMTR} errors={error}>
          <ScrollView>
              <Text style={{textAlign: 'center', fontWeight: 'bold', marginBottom: 15}}>DETALLES DEL VEHÍCULO</Text>
                  {
                    groupOptionsRef.current ?
                    groupOptionsRef.current.map((item, index)=> {
                      return (
                        <ScrollView>
                        {
                          //console.log(groupOptionsRef.options[1].current.length)
                        }
                        {
                          item.opciones.filter(x => x.IdGrupoRecurso == "ASI_DET_EXTERIOR" || x.IdGrupoRecurso == "ASI_DET_MOTOR").map((item, index)=> {
                          
                          if(index!=0)  setLengthArr(respuestasRefQ.current.length)
                          return (
                          <>
                          {
                            !index ? (
                            <>
                            <Text style={{fontWeight: 'bold', textTransform: 'uppercase', marginVertical: 10}} key={index}>{item.NombreGrupoRecurso}</Text> 
                            </>
                            ): <></>
                          }
                          <Text style={{marginTop: 15}} key={index}>{item.NombreOpcionRecurso} </Text>
                          <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginBottom: 5}}/>
                          <ButtonToggleGroup
                          highlightBackgroundColor={'#00BEF0'}
                          highlightTextColor={'white'}
                          inactiveBackgroundColor={'transparent'}
                          inactiveTextColor={'grey'}
                          values={['MALO', 'REGULAR', 'EXCELENTE']}
                          value = {respuestasQ[index+lengthArrRef.current]?.Respuesta}
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
                          newArray[index+lengthArrRef.current] = obj;
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
        {/*   <ProgressStep label="MOT">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep> */}
         {/*  <ProgressStep label="CAR">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep> */}
          <ProgressStep label="OBS">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep>
        </ProgressSteps>
        </View>
      </View>
      
     </>
     }
    </View>
    {/* </TouchableWithoutFeedback> */}
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
    margin:0
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
  }
});
