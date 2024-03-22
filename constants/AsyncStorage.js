import AsyncStorage from "@react-native-async-storage/async-storage";

// Save data to AsyncStorage
export const saveData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    console.log("Data saved successfully.");
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

// Retrieve data from AsyncStorage
export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // Data found, parse and return it
      return JSON.parse(value);
    } else {
      console.log("No data found for the key:", key);
      return null;
    }
  } catch (error) {
    console.error("Error getting data:", error);
    return null;
  }
};
