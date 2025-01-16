const express = require("express");
const userRouter = express.Router();
const authMiddleware = require("../middlewares/auth");
const roleMiddleWare = require("../middlewares/roleMiddleware");
const dbConnect = require("../config/db");
userRouter.get("/all-doctors", (req, res) => {
  const getAllDoctors = `
    SELECT * FROM healthhaven.doctors
  `;
  dbConnect.query(getAllDoctors, (err, result) => {
    if (err) {
      return res.status(400).send("Query Error");
    } else {
      return res.status(200).send(result);
    }
  });
});
userRouter.get("/user-profile/:email", (req, res) => {
  const { email } = req.params;
  const getUserProfile = `
    SELECT * FROM healthhaven.users where email = ?
  `;
  dbConnect.query(getUserProfile, [email], (err, result) => {
    if (err) {
      return res.status(400).send("Query Error");
    } else {
      return res.status(200).send(result);
    }
  });
});
userRouter.put(
  "/user-profile/:id",
  authMiddleware,
  roleMiddleWare("admin", "user"),
  (req, res) => {
    const { id } = req.params;
    const { name, phone, address1, address2, gender, dob } = req.body;

    // Convert address object into a JSON string
    const address = JSON.stringify({
      address1,
      address2,
    });

    // Query to update user profile
    const postUserProfile = `
    UPDATE healthhaven.users
    SET name = ?, address = ?, gender = ?, dob = ?, phone = ?
    WHERE id = ?
  `;

    // Query to update login profile
    const updateLoginProfile = `
    UPDATE healthhaven.login
    SET name = ?
    WHERE id = ?
  `;

    // Execute the first query
    dbConnect.query(
      postUserProfile,
      [name, address, gender, dob, phone, id],
      (err, result) => {
        if (err) {
          console.error("Error updating user profile:", err);
          return res.status(400).send("Query Error");
        } else {
          // Execute the second query
          dbConnect.query(updateLoginProfile, [name, id], (err, result) => {
            if (err) {
              console.error("Error updating login profile:", err);
              return res.status(400).send("Query Error");
            } else {
              return res.status(200).send("Profile Updated Successfully");
            }
          });
        }
      }
    );
  }
);

userRouter.post(
  "/user-appointments",
  authMiddleware,
  roleMiddleWare("admin", "user"),
  (req, res) => {
    const { user_id, doctor_id, appointment_date, appointment_time, status } =
      req.body; // Extract all required fields from req.body
    console.log(
      user_id,
      doctor_id,
      appointment_date,
      appointment_time,
      status,
      req.body,
      "status"
    );
    const selectUser = "select * from users where id=?";
    dbConnect.query(selectUser, [user_id], (err, result) => {
      if (err) {
        return res.send("invalid user");
      }
      const postAppointment = `
  INSERT INTO healthhaven.appointments(user_id, doctor_id, appointment_date, appointment_time, status)
  VALUES (?, ?, ?, ?, ?)
`;
      // Execute the query
      dbConnect.query(
        postAppointment,
        [user_id, doctor_id, appointment_date, appointment_time, status], // Pass correct array of values
        (err, result) => {
          if (err) {
            console.error("Database Query Error:", err); // Log the error for debugging
            return res.status(500).send({ message: "Internal Server Error" }); // Send proper HTTP status code
          } else {
            return res
              .status(200)
              .send({ message: "Appointment Added Successfully" });
          }
        }
      );
    });
  }
);

userRouter.get("/user-appointments/:email", (req, res) => {
  const { email } = req.params;
  const getAppointments = `
      SELECT
        appointments.id as appointmentsId,
        users.name AS userName,
         users.email as userEmail,
         users.id as userId,    
         appointments.appointment_time as appointmentTime,
         appointments.appointment_date as appointmentDate,
         doctors.name as doctorName,
         doctors.email as doctorEmail,
         doctors.fees as appoitmentFees,
         doctors.speciality as speciality,
         doctors.address as doctorAddress,
         appointments.status as appointmentStatus
FROM 
    healthhaven.appointments
INNER JOIN 
    healthhaven.users 
    ON healthhaven.users.id = healthhaven.appointments.user_id
INNER JOIN 
    healthhaven.doctors 
    ON healthhaven.doctors.id = healthhaven.appointments.doctor_id
WHERE 
    healthhaven.users.email = ?;
  `;
  dbConnect.query(getAppointments, [email], (err, result) => {
    if (err) {
      console.log(result, err, "err");
      return res.status(500).send("Internal Server Error");
    } else {
      return res.status(200).send(result);
    }
  });
});

userRouter.put("/user-appointments/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updateAppointment = `
     UPDATE healthhaven.appointments SET status = ? WHERE id = ?
  `;

  dbConnect.query(updateAppointment, [status, id], (err, result) => {
    if (err) {
      console.error("Database Query Error:", err);
      return res.status(500).send({ message: "Query Error" });
    }

    // Check for successful update
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Appointment not found" });
    }

    // Return appropriate response based on status
    if (status === "paid") {
      return res.status(200).send({ message: "Payment Successfully" });
    } else if (status === "cancel") {
      return res
        .status(200)
        .send({ message: "Successfully Appointment Canceled" });
    } else {
      return res.status(200).send({ message: "Appointment status updated" });
    }
  });
});

module.exports = userRouter;
