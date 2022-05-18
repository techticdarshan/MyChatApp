import {StyleSheet} from 'react-native';
export default styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerView: {
    height: 60,
    backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  item: {
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
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
});
