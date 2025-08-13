import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { pick, types, errorCodes } from "@react-native-documents/picker";
import * as ImagePicker from "react-native-image-picker";
import { url } from "../../Const";
import DatePicker from "react-native-date-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setTags } from "../redux/action/TagAction";

export const formatDate = (date: any) => {
  const iso = date.toISOString().split("T")[0];
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
};

const UploadFiles = () => {
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subOptions, setSubOptions] = useState<any>([]);
  const [allTags, setAllTags] = useState<any>([]);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const [newTag, setNewTag] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<any>(null);
  const [loader, setLoader] = useState(false)
  const [documentLoader, setDocumentLoader] = useState(false)
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDocumentTags()
  }, []);

  const fetchDocumentTags = async () => {
    try {
      setLoader(true)
      const token = await AsyncStorage.getItem('authToken');

      const res = await fetch(`${url}documentTags`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: `${token}`,
        },
        body: JSON.stringify({
          term: "",
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Document Tags Response:", data);
      if (data?.status) {
        setAllTags(data?.data)
        dispatch(setTags(data?.data))
      }

      return data;
    } catch (err) {
      console.error("Error fetching document tags:", err);
      return null;
    } finally {
      setLoader(false)
    }
  };


  const handleCategoryChange = (value: any) => {
    setCategory(value);
    setSubOptions(value === "Personal" ? ["John", "Tom", "Emily"] : ["Accounts", "HR", "IT", "Finance"]);
    setSubCategory("");
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
    }
    toggleTag(newTagObj);
    setNewTag("");
  };

  const pickDocument = async () => {
    try {
      const results = await pick({ type: [types.images, types.pdf], allowMultiSelection: false });
      const [selected] = results;
      console.log("selected : ", selected);
      setFile(selected);
    } catch (err: any) {
      if (err?.code !== errorCodes.OPERATION_CANCELED) {
        console.error("File pick error:", err);
      }
    }
  };


  const saveDocumentEntry = async () => {
    setDocumentLoader(true)
    try {
      const token = await AsyncStorage.getItem('authToken');
      const formData = new FormData();

      formData.append('file', {
        uri: file?.uri,
        type: file?.type,
        name: file?.name,
      });

      const payload = {
        major_head: category,
        minor_head: subCategory,
        document_date: formatDate(date),
        document_remarks: remarks,
        tags: selectedTags.map((tag: any) => ({ tag_name: tag?.label })),
        user_id: "dk"
      };
      formData.append('data', JSON.stringify(payload));

      // Send request

      console.log("FormData :", formData);

      const res = await fetch(`${url}saveDocumentEntry`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          token: `${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      console.log("API response:", result);
      if (result?.status) {
        Alert.alert(result?.message)
        setSelectedTags([])
        setCategory("")
        setSubCategory("")
        setRemarks("")
      }

    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setDocumentLoader(false)
    }
  };

  return (
    loader ?
      <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
      :
      <ScrollView contentContainerStyle={styles.container}>
        {/* Date Picker Trigger */}
        <Text style={styles.label}>Document Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setOpenDatePicker(true)}>
          <Text style={styles.dateButtonText}>
            {date ? date.toLocaleDateString("en-GB") : "Select Date"}
          </Text>
        </TouchableOpacity>

        {/* Modal Date Picker */}
        <DatePicker
          modal
          open={openDatePicker}
          date={date}
          mode="date"
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false);
            setDate(selectedDate);
          }}

          onCancel={() => setOpenDatePicker(false)}
        />

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

        <Text style={styles.label}>Remarks</Text>
        <TextInput style={styles.textArea} placeholder="Enter remarks" value={remarks} onChangeText={setRemarks} multiline />

        <View style={styles.fileBtns}>
          <Button title="Pick File" onPress={pickDocument} />
          {/* <Button title="Take Picture" onPress={takePicture} /> */}
        </View>

        {file && (
          <Text style={{ fontSize: 12, color: "green" }}>
            Selected: {file.name || file.fileName || file.localUri}
          </Text>
        )}

        <TouchableOpacity
          style={styles.submitBtn}
          disabled={documentLoader}
          onPress={() => {
            saveDocumentEntry()
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  label: { fontWeight: "bold", marginTop: 10 },
  dateButton: {
    padding: 10,
    color: "#000",
    borderRadius: 6,
    marginTop: 5,
    // alignItems: "center",
  },
  dateButtonText: { color: "#000", fontSize: 16 },
  picker: { borderWidth: 1, borderColor: "#ccc", marginTop: 5, marginBottom: 10 },
  tagRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  tagInput: { borderBottomWidth: 1, flex: 1, marginRight: 10 },
  tagList: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  tag: { backgroundColor: "#007bff", padding: 5, borderRadius: 5, marginRight: 5, marginTop: 5 },
  textArea: { borderWidth: 1, borderRadius: 5, padding: 10, marginTop: 5, height: 80 },
  fileBtns: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  submitBtn: { backgroundColor: "#28a745", padding: 15, alignItems: "center", borderRadius: 5, marginTop: 20 }
});

export default UploadFiles;
