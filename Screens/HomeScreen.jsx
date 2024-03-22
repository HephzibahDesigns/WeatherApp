import {
  View,
  StatusBar,
  Image,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { Fragment } from "react";
import axios from "axios";
import { weatherImages } from "../constants/index.js";
import { getData, saveData } from "../constants/AsyncStorage.js";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locationSearch, setLocationSearch] = useState(null);
  const [city, setCity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    // Load city data from AsyncStorage on component mount
    loadCityFromStorage();
  }, []);

  // Function to load city data from AsyncStorage
  const loadCityFromStorage = async () => {
    try {
      const savedCity = await getData("city"); // Use getData function to retrieve city from AsyncStorage
      if (savedCity) {
        setCity(savedCity);
        fetchLocationData(savedCity); // Fetch weather data for the saved city
      }
    } catch (error) {
      console.error("Error loading city from AsyncStorage:", error);
    }
  };

  // Function to save city data to AsyncStorage
  const saveCityToStorage = async (cityName) => {
    try {
      await saveData("city", cityName); // Use saveData function to save city to AsyncStorage
    } catch (error) {
      console.error("Error saving city to AsyncStorage:", error);
    }
  };

  // Calling Api
  const API_KEY = "c6ee337751ec41d09f510225241403";

  const LocationUrl = ` https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no `;

  const fetchLocationData = useCallback(() => {
    setIsLoading(true);
    axios
      .get(LocationUrl)
      .then((response) => {
        // No need to parse the response with JSON.parse()
        const jsonResponse = response;
        console.log(jsonResponse.data);

        console.log(jsonResponse.data.location.name);

        // Access the desired data fields
        const time = jsonResponse.data.location.localtime;
        const temperature = jsonResponse.data.current.temp_c;
        const tempCondition = jsonResponse.data.current.condition.text;
        const humidity = jsonResponse.data.current.humidity;
        const wind_mph = jsonResponse.data.current.wind_mph;
        const name = jsonResponse.data.location.name;
        const country = jsonResponse.data.location.country;

        const dayOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const day = jsonResponse.data.forecast.forecastday.map(
          (item, index) => {
            // console.log("Item:", item.day.avgtemp_c); // Log the item to inspect its structure
            const date = new Date(item.date);
            const averageTemp = item.day.avgtemp_c;
            const tempCondition = item.day.condition.text;
            console.log(tempCondition);
            return {
              dayOfWeek: dayOfWeek[date.getDay()],
              averageTemp: averageTemp,
              temperatureCondition: tempCondition,
            };
          }
        );

        // Parse the time string into a Date object
        const date = new Date(time);

        // Format the time (assuming 12-hour format with AM/PM)
        const hours = date.getHours() % 12 || 12; // Get hours in 12-hour format
        const minutes = date.getMinutes();
        const period = date.getHours() >= 12 ? "PM" : "AM"; // Determine AM or PM

        // Construct the formatted time string
        const formattedTime = `${hours}:${
          minutes < 10 ? "0" : ""
        }${minutes} ${period}`;

        // // Now you can work with the extracted data
        console.log("Time:", formattedTime);
        console.log("Temperature:", temperature);
        console.log("Humidity:", humidity);
        console.log("name :", name);
        console.log("country :", country);
        console.log("tempCondition :", tempCondition);
        console.log("wind: ", wind_mph);

        // Set the extracted data to the locationSearch state
        setLocationSearch({
          temperature,
          humidity,
          wind_mph,
          name,
          country,
          tempCondition,
          formattedTime,
          day,
        });
      })
      .catch((error) => {
        console.error("Error fetching location data:", error);
        setLocationSearch(null);
      })
      .finally(() => {
        setIsLoading(false); // Always set isLoading to false after API request
      });
  }, [LocationUrl]);

  const debounceFetch = () => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(fetchLocationData, 1000); // Adjust debounce delay as needed
  };

  const handleCityChange = (text) => {
    setCity(text);
    if (text.length >= 3) {
      debounceFetch();
    }
  };

  const handleLocation = async () => {
    try {
      setCity("");
      setLocationSearch(null);
      await saveCityToStorage(city);
    } catch (error) {
      console.error("Error handling location:", error);
    }
  };

  const toggleSwitch = () => {
    toggleSearch(!showSearch);
  };

  return (
    <View>
      <View className="flex items-center relative">
        <Image
          source={require("../assets/night.png")}
          style={{
            resizeMode: "cover",
            width: "100%",
          }}
          blurRadius={4}
          className="absolute"
        />
      </View>
      <ScrollView>
        <View className="w-full z-50 mt-10">
          <View
            className={
              showSearch
                ? "bg-white/90 flex-row justify-end items-center rounded-full mx-5"
                : "tranparent flex-row justify-end items-center rounded-full mx-5 ease-in duration-100"
            }
          >
            {showSearch ? (
              <TextInput
                value={city}
                onChangeText={handleCityChange}
                placeholder="Search City"
                className="pl-6 flex-1 text-base text-black"
                onSubmitEditing={() => handleLocation(locationSearch)}
              />
            ) : null}

            <TouchableOpacity
              onPress={toggleSwitch}
              className="bg-white/75 p-3 rounded-full self-center m-1"
            >
              <FontAwesome5 name="search" size={20} color="black" />
            </TouchableOpacity>
          </View>

          {isLoading && (
            <View
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 25,
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {/* Weather Forecast */}
          <View className="flex flex-col items-center mt-8">
            {locationSearch ? (
              <Fragment>
                <Text className="text-white text-xl font-bold">
                  {locationSearch.name} {", "}
                  <Text className="text-gray-100 text-base font-medium">
                    {locationSearch.country}
                  </Text>
                </Text>

                {/* Weather image */}
                <View className="flex justify-center py-10">
                  {/* Use the appropriate image source based on the weather condition */}
                  <Image
                    source={weatherImages[locationSearch.tempCondition]}
                    style={{ width: 200, height: 200, resizeMode: "contain" }}
                  />
                </View>

                {/* Degree celcius */}
                <View className="my-3">
                  <Text className="text-center text-4xl text-white font-medium">
                    {locationSearch.temperature}&#176;
                  </Text>
                  <Text className="text-center text-xl font-normal text-white tracking-widest">
                    {locationSearch.tempCondition}
                  </Text>
                </View>

                {/* Other Stats */}
                <View className="flex flex-row items-center space-x-10 my-10">
                  <View className="flex flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/wind.png")}
                      style={{ width: 20, height: 20, resizeMode: "contain" }}
                    />
                    <Text className="text-white text-base font-medium">
                      {locationSearch.wind_mph} MPH
                    </Text>
                  </View>

                  <View className="flex flex-row items-center space-x-2 z-50">
                    <Image
                      source={require("../assets/Humidity.png")}
                      style={{ width: 20, height: 20, resizeMode: "contain" }}
                    />
                    <Text className="text-white text-base font-medium">
                      {locationSearch.humidity} %
                    </Text>
                  </View>

                  <View className="flex flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/Sun.png")}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: "contain",
                      }}
                    />
                    <Text className="text-white text-base font-medium">
                      {locationSearch.formattedTime}
                    </Text>
                  </View>
                </View>
              </Fragment>
            ) : (
              <Fragment>
                <Text className="text-white text-2xl font-bold">
                  London,{" "}
                  <Text className="text-gray-100 text-lg font-medium">
                    United Kingdom
                  </Text>
                </Text>

                {/* Weather image */}
                <View className="flex justify-center py-10">
                  {/* Use the appropriate image source based on the weather condition */}
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{ width: 200, height: 200, resizeMode: "contain" }}
                  />
                </View>

                {/* Degree celcius */}
                <View className="my-3">
                  <Text className="text-center text-4xl text-white font-medium">
                    23&#176;
                  </Text>
                  <Text className="text-center text-xl font-normal text-white tracking-widest">
                    Partly Cloudy
                  </Text>
                </View>

                {/* Other Stats */}
                <View className="flex flex-row items-center space-x-10 my-10">
                  <View className="flex flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/wind.png")}
                      style={{ width: 20, height: 20, resizeMode: "contain" }}
                    />
                    <Text className="text-white text-base font-medium">
                      13 KM
                    </Text>
                  </View>

                  <View className="flex flex-row items-center space-x-2 z-50">
                    <Image
                      source={require("../assets/Humidity.png")}
                      style={{ width: 20, height: 20, resizeMode: "contain" }}
                    />
                    <Text className="text-white text-base font-medium">
                      23 %
                    </Text>
                  </View>

                  <View className="flex flex-row items-center space-x-2">
                    <Image
                      source={require("../assets/Sun.png")}
                      style={{
                        width: 20,
                        height: 20,
                        resizeMode: "contain",
                      }}
                    />
                    <Text className="text-white text-base font-medium">
                      6:08 AM
                    </Text>
                  </View>
                </View>
              </Fragment>
            )}
          </View>
        </View>

        {/* Forecast for the next few days */}

        <View className="mx-6 z-30">
          <View className="flex flex-row items-center space-x-3">
            <Image
              source={require("../assets/Calendar.png")}
              style={{
                width: 25,
                height: 25,
                resizeMode: "contain",
              }}
            />

            <Text className="text-base font-medium text-white">
              Daily Forecast
            </Text>
          </View>

          <ScrollView
            horizontal={true}
            showHorizontalScrollIndicator={false}
            className="space-x-6"
          >
            {locationSearch ? (
              <View className="flex flex-row space-x-3">
                {locationSearch.day.map((dayData, index) => (
                  <View
                    className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative"
                    key={index}
                  >
                    <Image
                      source={weatherImages[dayData.temperatureCondition]}
                      style={{
                        width: 50,
                        height: 50,
                        resizeMode: "contain",
                      }}
                    />

                    <Text className=" text-white text-sm font-medium ">
                      {dayData.dayOfWeek}
                      {index < locationSearch.day.length - 1 ? ", " : ""}
                    </Text>

                    <Text className="text-center text-lg text-white font-semibold">
                      {dayData.averageTemp}&#176;
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Fragment>
                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Monday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    13&#176;
                  </Text>
                </View>

                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Tuesday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    28&#176;
                  </Text>
                </View>

                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Wedsday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    10&#176;
                  </Text>
                </View>

                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Thursday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    20&#176;
                  </Text>
                </View>

                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Friday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    20&#176;
                  </Text>
                </View>

                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Saturday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    20&#176;
                  </Text>
                </View>

                <View className="flex justify-center items-center w-24 py-2 my-4 bg-white/20 rounded-xl relative">
                  <Image
                    source={require("../assets/partly-cloudy.png")}
                    style={{
                      width: 50,
                      height: 50,
                      resizeMode: "contain",
                    }}
                  />
                  <Text className=" text-white text-sm font-medium ">
                    Sunday
                  </Text>
                  <Text className="text-center text-lg text-white font-semibold">
                    20&#176;
                  </Text>
                </View>
              </Fragment>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
