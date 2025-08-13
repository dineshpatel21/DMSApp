import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Button,
  Image,
  ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DatePicker from "react-native-date-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDate } from "./UploadFiles";
import { useDispatch, useSelector } from "react-redux";
import { addTag } from "../redux/action/TagAction";
import { url } from "../../Const";

const SearchAndPreview = (props: any) => {
  const dt: any = useSelector((state: any) => state.tagsReducer?.allTags)
  const dispatch = useDispatch();
  const [category, setCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [openFromPicker, setOpenFromPicker] = useState(false);
  const [openToPicker, setOpenToPicker] = useState(false);
  const [subOptions, setSubOptions] = useState<any>([]);
  const [subCategory, setSubCategory] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const [allTags, setAllTags] = useState<any>(dt ?? []);
  const [tags, setTags] = useState<string[]>([]);
  const [searchedDocument, setSearchDocument] = useState([])
  const [searchLoader, setSearchLoader] = useState(false)


  useEffect(() => {
    setAllTags(dt)
  }, [])

  const handleSearch = async () => {
    setSearchLoader(true)
    try {
      const token = await AsyncStorage.getItem('authToken');

      const body = {
        major_head: category,
        minor_head: subCategory,
        from_date: formatDate(fromDate),
        to_date: formatDate(toDate),
        tags: selectedTags.map((tag: any) => ({ tag_name: tag?.label })),
        uploaded_by: "dk",
        start: 0,
        length: 10,
        filterId: "",
        search: {
          value: ""
        }
      };

      console.log("body : ", body);


      const res = await fetch(`${url}searchDocumentEntry`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: `${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Search Document Entry Response:", data);
      if (data.status) {
        setSearchDocument(data?.data)
        props.navigation.navigate("SearchResult", { result: data?.data })
      }

      return data;
    } catch (err) {
      console.error("Error searching document entry:", err);
      return null;
    } finally {
      setSearchLoader(false)
    }
  };


  const toggleTag = (tag: any) => {
    if (selectedTags.some((t: any) => t.id === tag.id)) {
      // remove tag
      setSelectedTags(selectedTags.filter((t: any) => t.id !== tag.id));
    } else {
      // add tag
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddTag = () => {
    const tagTrimmed = newTag.trim();
    if (!tagTrimmed) return;

    const newTagObj = { id: Date.now().toString(), label: tagTrimmed };

    if (!allTags.some((t: any) => t.label.toLowerCase() === tagTrimmed.toLowerCase())) {
      setAllTags([...allTags, newTagObj]);
      dispatch(addTag(newTagObj))
    }
    toggleTag(newTagObj);

    setNewTag("");
  };

  const handleCategoryChange = (value: any) => {
    setCategory(value);
    setSubOptions(value === "Personal" ? ["John", "Tom", "Emily"] : ["Accounts", "HR", "IT", "Finance"]);
    setSubCategory("");
  };


  return (
    <ScrollView style={styles.container}>
      {/* Search Filters */}
      <Text style={styles.label}>Category</Text>
      <Picker selectedValue={category} onValueChange={handleCategoryChange} style={styles.picker}>
        <Picker.Item label="Select Category" value="" />
        <Picker.Item label="Personal" value="Personal" />
        <Picker.Item label="Professional" value="Professional" />
      </Picker>

      {category ? (
        <>
          <Text style={styles.label}>Sub Category</Text>
          <Picker selectedValue={subCategory} onValueChange={setSubCategory} style={styles.picker}>
            <Picker.Item label="Select Sub Category" value="" />
            {subOptions.map((opt: any, i: number) => (
              <Picker.Item key={i} label={opt} value={opt} />
            ))}
          </Picker>
        </>
      ) : null}

      <>
        <Text style={styles.label}>Tags</Text>

        {/* Input for adding tags */}
        <View style={styles.tagRow}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add tag"
            value={newTag}
            onChangeText={setNewTag}
          />
          <Button title="Add" onPress={handleAddTag} />
        </View>

        {/* Available tags from server + newly added */}
        <ScrollView horizontal style={styles.tagList}>
          {allTags.map((tag: any, i: number) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.tag,
                  { backgroundColor: isSelected ? "#007BFF" : "#888" }
                ]}
              >
                <Text style={{ color: "#fff" }}>{tag.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected tags display */}
        <Text style={{ marginTop: 10, fontWeight: "bold" }}>Selected Tags:</Text>
        <View style={styles.tagList}>
          {selectedTags.map((tag: any, i: number) => (
            <View key={i} style={[styles.tag, { backgroundColor: "#007BFF" }]}>
              <Text style={{ color: "#fff" }}>{tag.label}</Text>
            </View>
          ))}
        </View>
      </>

      {/* From Date */}
      <Text style={styles.label}>From Date</Text>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setOpenFromPicker(true)}
      >
        <Text style={styles.dateText}>
          {fromDate ? fromDate.toLocaleDateString("en-GB") : "Select Date"}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={openFromPicker}
        date={fromDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenFromPicker(false);
          setFromDate(date);
        }}
        onCancel={() => setOpenFromPicker(false)}
      />

      {/* To Date */}
      <Text style={styles.label}>To Date</Text>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setOpenToPicker(true)}
      >
        <Text style={styles.dateText}>
          {toDate ? toDate.toLocaleDateString("en-GB") : "Select Date"}
        </Text>
      </TouchableOpacity>
      <DatePicker
        modal
        open={openToPicker}
        date={toDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setOpenToPicker(false);
          setToDate(date);
        }}
        onCancel={() => setOpenToPicker(false)}
      />

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        {searchLoader ? <ActivityIndicator size="small" color="#007BFF" /> : <Text style={{ color: "#fff" }}>Search</Text>}
      </TouchableOpacity>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  label: { fontWeight: "bold", marginTop: 10 },
  tagRow: { flexDirection: "row", alignItems: "center" },
  tagInput: { borderBottomWidth: 1, flex: 1, marginRight: 10 },
  addBtn: { backgroundColor: "#007bff", padding: 8, borderRadius: 5 },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5
  },
  tag: {
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginTop: 5
  },
  dateBtn: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginTop: 5
  },
  dateText: {
    fontSize: 16,
    color: "#333"
  },
  searchBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center"
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },
  preview: { color: "#007bff", marginHorizontal: 10 },
  download: { color: "#28a745" },
  zipBtn: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center"
  },
  picker: { borderWidth: 1, borderColor: "#ccc", marginTop: 5, marginBottom: 10 },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
  },
  headText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SearchAndPreview;
