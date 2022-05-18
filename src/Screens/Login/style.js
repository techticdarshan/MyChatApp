import {StyleSheet} from 'react-native';
export default styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerView: {
    height: 60,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: 'green',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 10,
    marginVertical: 20,
  },
  text: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  textInput: {
    borderWidth: 0.5,
    borderColor: 'grey',
    width: 330,
    height: 50,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
});
