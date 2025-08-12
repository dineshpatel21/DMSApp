import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert, ScrollView, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { pick, types, errorCodes } from "@react-native-documents/picker";
import * as ImagePicker from "react-native-image-picker";
import { url } from "../../Const";
import DatePicker from "react-native-date-picker";

const UploadFiles = () => {
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false); // NEW
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subOptions, setSubOptions] = useState<any>([]);
  const [tags, setTags] = useState<any>([]);
  const [allTags, setAllTags] = useState<any>([]);
  const [newTag, setNewTag] = useState<any>("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    fetch("https://example.com/api/tags")
      .then(res => res.json())
      .then(data => setAllTags(data))
      .catch(err => console.error("Error fetching tags:", err));
  }, []);

  const handleCategoryChange = (value: any) => {
    setCategory(value);
    setSubOptions(value === "Personal" ? ["John", "Tom", "Emily"] : ["Accounts", "HR", "IT", "Finance"]);
    setSubCategory("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      if (!allTags.includes(newTag)) {
        fetch(`${url}documentTags`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag: newTag })
        }).catch(err => console.error("Error saving tag:", err));
      }
      setNewTag("");
    }
  };

  const pickDocument = async () => {
    try {
      const results = await pick({ type: [types.images, types.pdf], allowMultiSelection: false });
      const [selected] = results;
      setFile(selected);
    } catch (err: any) {
      if (err?.code !== errorCodes.OPERATION_CANCELED) {
        console.error("File pick error:", err);
      }
    }
  };

  const takePicture = () => {
    ImagePicker.launchCamera({ mediaType: "photo" }, (response: any) => {
      if (response.didCancel) return;
      if (response.errorMessage) return Alert.alert("Error", response.errorMessage);
      setFile(response.assets[0]);
    });
  };

  return (
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

      <Text style={styles.label}>Tags</Text>
      <View style={styles.tagRow}>
        <TextInput style={styles.tagInput} placeholder="Add tag" value={newTag} onChangeText={setNewTag} />
        <Button title="Add" onPress={handleAddTag} />
      </View>
      <View style={styles.tagList}>
        {tags.map((tag: any, i: number) => (
          <View key={i} style={styles.tag}>
            <Text style={{ color: "#fff" }}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Remarks</Text>
      <TextInput style={styles.textArea} placeholder="Enter remarks" value={remarks} onChangeText={setRemarks} multiline />

      <View style={styles.fileBtns}>
        <Button title="Pick File" onPress={pickDocument} />
        <Button title="Take Picture" onPress={takePicture} />
      </View>

      {file && (
        <Text style={{ fontSize: 12, color: "green" }}>
          Selected: {file.name || file.fileName || file.localUri}
        </Text>
      )}

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          const uploads = {
            major_head: category,
            minor_head: subCategory,
            document_date: date.toISOString().split("T")[0], // formatted
            document_remarks: remarks,
            tags: tags.map((tag: any) => ({ tag_name: tag })),
            user_id: "nitin"
          };
          Alert.alert("Form Submitted", JSON.stringify(uploads, null, 2));
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
    padding: 12,
    // backgroundColor: "#007bff",
    color: "#000",
    borderRadius: 6,
    marginTop: 5,
    alignItems: "center",
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
