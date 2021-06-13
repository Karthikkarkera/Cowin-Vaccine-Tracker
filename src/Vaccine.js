import React, { useEffect, useState, useRef } from "react";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import DateFnsUtils from "@date-io/date-fns";
import Button from "@material-ui/core/Button";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";
import "./vaccine.css";
import { format } from "date-fns";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function Vaccine() {
  const classes = useStyles();
  const didMount = useRef(false);
  const [states, setStates] = useState([]);
  const [stateCode, setStateCode] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtCode, setDistrictCode] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("");
  const [vaccineData, setVaccineData] = useState([]);
  const [toSearchValue, setSearchValue] = useState("District");
  const [pincode, setPincode] = useState("");
  const [toSearch] = useState(["District", "Pin-code"]);

  useEffect(() => {
    fetch("https://cdn-api.co-vin.in/api/v2/admin/location/states")
      .then((response) => response.json())
      .then((data) => setStates(data.states));
  }, []);

  useEffect(() => {
    if (didMount.current) {
      fetch(
        `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateCode}`
      )
        .then((response) => response.json())
        .then((data) => setDistricts(data.districts));
    } else {
      didMount.current = true;
    }
  }, [stateCode]);

  const changeState = (e) => {
    setStateCode(e.target.value);
  };

  const changeDistrict = (e) => {
    setDistrictCode(e.target.value);
  };

  const handleDateChange = (date) => {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();

    var finalDate = month + "-" + day + "-" + year;
    setSelectedDate(finalDate);
  };

  useEffect(() => {
    console.log(selectedDate);
    var dateArray = selectedDate.toString().split("-");
    var finalDate = dateArray[1] + "-" + dateArray[0] + "-" + dateArray[2];

    setFormattedDate(finalDate);
    console.log(finalDate);
  }, [selectedDate]);

  const fetchDataUsingDistrict = async () => {
    fetch(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${districtCode}&date=${formattedDate}`
    )
      .then((response) => response.json())
      .then((data) => sortedData(data.sessions));
  };

  const sortedData = async (data) => {
    const tempData = data;
    console.log(data);
    data.sort((a, b) => b.available_capacity - a.available_capacity);
    setVaccineData(tempData);
  };

  const fetchDataUsingPin = async () => {
    if (pincode.length !== 6) alert("6 Digit Minimum");
    else {
      await fetch(
        `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${formattedDate}`
      )
        .then((response) => response.json())
        .then((data) => sortedData(data.sessions));
    }
  };

  const handlePinChange = (e) => {
    setVaccineData([]);
    setPincode(e.target.value);
  };

  return (
    <div class="vaccine">
      <br></br>
      <h2>#VaccinateMe</h2>
      <br></br>
      <br></br>
      <Button
        className="btn"
        variant="outlined"
        color="primary"
        onClick={() => setSearchValue("District")}
      >
        District
      </Button>
      <Button
        className="btn"
        variant="outlined"
        color="primary"
        onClick={() => setSearchValue("Pin-code")}
      >
        Pincode
      </Button>
      <br></br>
      <br></br>

      {toSearchValue === "District" ? (
        <div>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">
              State
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              // value={age}
              onChange={changeState}
              label="State"
            >
              <MenuItem value="">
                <em>Select A State</em>
              </MenuItem>
              {states.map((stateData) => (
                <MenuItem value={stateData.state_id}>
                  {stateData.state_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel id="demo-simple-select-outlined-label">
              District
            </InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              // value={age}
              onChange={changeDistrict}
              label="State"
            >
              <MenuItem value="">
                <em>Select A State</em>
              </MenuItem>
              {districts.map((district) => (
                <MenuItem value={district.district_id}>
                  {district.district_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br></br>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              margin="normal"
              id="date-picker-dialog"
              format="dd-MM-yyyy"
              value={selectedDate}
              onChange={handleDateChange}
              inputFormat="dd-MM-yyyy"
              className="districtDateInput"
            />
          </MuiPickersUtilsProvider>
          <br></br>
          <br></br>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchDataUsingDistrict}
          >
            Search Slot
          </Button>
          {vaccineData.map((vaccine) => (
            <div className="slot-details">
              <div className="slot-left">
                <h4>{vaccine.name}</h4>
                <p>
                  {vaccine.address}, {vaccine.pincode} <br></br>
                  Vaccine : {vaccine.vaccine}
                  {}
                </p>
              </div>
              <div
                className={
                  vaccine.available_capacity == 0
                    ? "slot-right-available"
                    : "slot-right"
                }
              >
                <p>{vaccine.available_capacity} Slots</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {toSearchValue === "Pin-code" ? (
        <div>
          <TextField
            id="outlined-basic"
            label="Pin-Code"
            variant="outlined"
            onChange={handlePinChange}
          />
          <br></br>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              margin="normal"
              id="date-picker-dialog"
              format="dd-MM-yyyy"
              value={selectedDate}
              onChange={handleDateChange}
              inputFormat="dd-MM-yyyy"
              className="districtDateInput"
            />
          </MuiPickersUtilsProvider>
          <br></br>
          <br></br>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchDataUsingPin}
          >
            Search Slot
          </Button>
          {vaccineData.map((vaccine) => (
            <div className="slot-details">
              <div className="slot-left">
                <h4>{vaccine.name}</h4>
                <p>
                  {vaccine.address}, {vaccine.pincode} <br></br>
                  Vaccine : {vaccine.vaccine}
                  {}
                </p>
              </div>
              <div
                className={
                  vaccine.available_capacity == 0
                    ? "slot-right-available"
                    : "slot-right"
                }
              >
                <p>{vaccine.available_capacity} Slots</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <br></br>
      <br></br>
    </div>
  );
}

export default Vaccine;
