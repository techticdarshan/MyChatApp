import {StyleSheet} from 'react-native';
export default styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerView: {
    height: 60,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  floatButton: {
    backgroundColor: 'green',
    height: 50,
    width: 50,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 30,
    bottom: 50,
  },
  floatText: {
    color: 'white',
    fontSize: 20,
    padding: 15,
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    flex: 1,
  },
  imgItem: {
    height: 30,
    width: 30,
    marginRight: 10,
    borderRadius: 50,
  },
  line: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    color: '#000',
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  title1: {
    color: 'grey',
    fontSize: 12,
    marginLeft: 10,
  },
  typingText: {
    color: 'green',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});
