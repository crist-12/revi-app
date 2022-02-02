
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { ProgressStep, ProgressSteps } from 'react-native-progress-steps';
import { DropDownList, DropDownProvider, DropownProvider } from 'react-native-universal-dropdownlist'
import { getAllRegisteredUsers } from '../api';
import RNSearchablePicker from 'react-native-searchable-picker';
import {Picker} from '@react-native-picker/picker';
import ModalSelector from 'react-native-modal-selector-searchable'

const HomeScreen = ({navigation}) => {

const [users, setUsers] = useState([]);
const [vehicles, setVehicle] = useState([]);
const [selectedVehicle, setSelectedVehicle] = useState([])
const [driver, setDriver] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [filteredUser, setFilteredUser] = useState(null)
const [filteredVehicle, setFilteredVehicle] = useState(null)

var aux = [];

const getDropDownData = async() => {
  try{
    const response = await fetch("http://192.168.1.134:3000/users");

    const data = await response.json();   
    parseObject(data);
  }catch(error){
      console.log(error);
  }
}

const getAllVehicles = async() => {
  try{
    const response = await fetch("http://192.168.1.134:3000/vehiculos");
    const data = await response.json();   
    parseVehicleObject(data);
  }catch(error){
      console.log(error);
  }
}

const getFilteredUser = async(key)=> {
  try{
    const response = await fetch("http://192.168.1.134:3000/users/" + new URLSearchParams({
      id : key
    }));
    const data = await response.json();   
    setFilteredUser(data);
  }catch(error){
      console.log(error);
  }
}

const getFilteredVehicles = async(key)=> {
  try{
    const response = await fetch("http://192.168.1.134:3000/vehicles/" + new URLSearchParams({
      id : key
    }));

    const data = await response.json();   
    console.log(data);
    setFilteredVehicle(data);
  }catch(error){
      console.log(error);
  }
}

const parseObject = (data) => { 
  data.forEach(element => {
    aux.push({
      label: element.NombreUsuario,
      key: element.IdUsuario
    })
  });
  setUsers(aux)
}

const parseVehicleObject = (data) => {
  var aux2 = [];
  data.forEach(element => {
    aux2.push({
      label: element.VehPlaca,
      key: element.VehCodigoVehiculo
    })
  });
  setVehicle(aux2)
}

  useEffect(()=>{
    getDropDownData();
    getAllVehicles();
    setIsLoading(false)
    //console.log(users)
  }, [])

  useState(()=> {
    setFilteredUser(filteredUser)
  }, [filteredUser])

  useState(()=> {
    setFilteredVehicle(filteredUser)
  }, [filteredVehicle])

  const showUserData = () => {
    return(
      <>
        <Text>NOMBRE: {filteredUser.NombreUsuario}</Text>
        <Text>SUCURSAL: {filteredUser.NombreUbicacion}</Text>
      </>
    )
  }


  const handlerItem = async(option, type) => {
    if(type == "driver"){
      setDriver(option);
      await getFilteredUser(option.key);
      console.log(filteredUser);
    }else{
      setSelectedVehicle(option);
      await getFilteredVehicles(option.key);
    }
  }


  return (
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
        <ProgressSteps>
          <ProgressStep label="Datos Generales">
              <View style={styles.picker}>
               {/*  <Picker>
                 {
                    users.map(item => {
                      return <Picker.Item label={item.label} value={item.value} />

                    })
                  }
                </Picker> */}
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
                <Text>NOMBRE:</Text>{
                  driver ?
                  <Text>{driver.NombreUsuario}</Text>:<Text>Sin datos</Text>
                }
              </View>
          </ProgressStep>
          <ProgressStep label="Estado General">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 2!</Text>
              </View>
          </ProgressStep>
          <ProgressStep label="Interior">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep>
          <ProgressStep label="Exterior">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep>
          <ProgressStep label="Motor">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep>
          <ProgressStep label="Carrocería">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep>
          <ProgressStep label="Observaciones">
              <View style={{ alignItems: 'center' }}>
                  <Text>This is the content within step 3!</Text>
              </View>
          </ProgressStep>
        </ProgressSteps>
      </View>
      
     </>
     }
    </View>
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
    margin: 20
  }
});
