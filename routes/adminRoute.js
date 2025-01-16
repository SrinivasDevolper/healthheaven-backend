const express = require("express");
const adminRouter = express.Router();
const authMiddleware = require("../middlewares/auth");
const dbConnect = require("../config/db");
const bcrypt = require("bcrypt");
const roleMiddleWare = require("../middlewares/roleMiddleware");
adminRouter.post(
  "/add-doctor",
  authMiddleware,
  roleMiddleWare("admin"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        experience,
        available,
        fees,
        about,
        speciality,
        degree,
        address1,
        address2,
        slots_booked,
      } = req.body;
      console.log(
        name,
        email,
        password,
        experience,
        available,
        fees,
        about,
        speciality,
        degree,
        address1,
        address2,
        slots_booked,
        "reqbody"
      );
      if (!name || !email || !password) {
        return res.status(400).send("Please enter full details.");
      }
      const bcryptPassword = await bcrypt.hash(password, 10);
      if (!bcryptPassword) {
        return res.status(500).send("Password hashing failed.");
      }
      const doctorAddress = JSON.stringify({ address1, address2 });
      const getDetailsDoctor = `
        SELECT * from healthhaven.doctors WHERE email = ?
      `;
      dbConnect.query(getDetailsDoctor, [email], async (err, result) => {
        if (err) {
          return res.status(500).send("Query Error");
        } else {
          const addDoctor = `
          INSERT INTO healthhaven.doctors (
            name, email, password, experience, available, fees, about, speciality, degree, address, slots_booked
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
          dbConnect.query(
            addDoctor,
            [
              name,
              email,
              bcryptPassword,
              experience,
              available ? 1 : 0,
              fees,
              about,
              speciality,
              degree,
              doctorAddress,
              slots_booked || null,
            ],
            (err, result) => {
              console.log(result, "result");
              if (err) {
                console.error("Error inserting into doctors table:", err);
                return res.status(500).send("Internal Server Error.");
              }
              if (result.affectedRows === 0) {
                return res.status(404).send("Doctor Already exists.");
              }
              return res
                .status(200)
                .json({ message: "New doctor added successfully." });
            }
          );
        }
      });
    } catch (error) {
      console.error("Error in add-doctor route:", error);
      return res.status(500).send("Internal Server Error.");
    }
  }
);

adminRouter.get(
  "/add-doctor",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    const getDoctorList = `
    SELECT * FROM healthhaven.doctors
  `;
    dbConnect.query(getDoctorList, (err, result) => {
      if (err) {
        res.status(500).send("Query Error");
      } else {
        res.status(200).send(result);
      }
    });
  }
);

adminRouter.put(
  "/add-doctor/:id",
  authMiddleware,
  roleMiddleWare("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;
    console.log(id, available);
    const updateDoctorList = `UPDATE healthhaven.doctors SET available = ? WHERE id = ?`;
    dbConnect.query(updateDoctorList, [available, id], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      } else {
        return res.status(200).json({ message: "Update Successfully" });
      }
    });
  }
);

adminRouter.get(
  "/doctors-count",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    const getDoctorCount = `
    SELECT * FROM healthhaven.doctors
  `;
    dbConnect.query(getDoctorCount, (err, result) => {
      if (err) {
        return res.status(500).send("Internal Sever Error");
      } else {
        return res.status(200).send(result);
      }
    });
  }
);

adminRouter.get(
  "/patient-count",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    const getDoctorCount = `
    SELECT * FROM healthhaven.users where name != "admin"
  `;
    dbConnect.query(getDoctorCount, (err, result) => {
      if (err) {
        return res.status(500).send("Internal Sever Error");
      } else {
        return res.status(200).send(result);
      }
    });
  }
);

adminRouter.get(
  "/appointments-count",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    const getDoctorCount = `
    SELECT count(*) as count FROM healthhaven.appointments
  `;
    dbConnect.query(getDoctorCount, (err, result) => {
      if (err) {
        return res.status(500).send("Internal Sever Error");
      } else {
        return res.status(200).send(result);
      }
    });
  }
);
//Latest appointments Page
adminRouter.get(
  "/admin-appointment",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    const getAppointments = `
      SELECT healthhaven.appointments.id, name, appointment_date, appointment_time as appointment_time from healthhaven.appointments inner join healthhaven.users ON appointments.user_id = users.id order by appointment_date DESC limit 3 offset 0;
    `;
    dbConnect.query(getAppointments, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Sever error");
      } else {
        return res.status(200).send(result);
      }
    });
  }
);

adminRouter.delete(
  "/admin-appointment/:id",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM healthhaven.appointments WHERE id = ?`;
    dbConnect.query(deleteQuery, id, (err, result) => {
      if (err) {
        return res.status(403).json({ message: "error to delete id" });
      }
      if (result.affectedRows === 0) {
        return res.status(403).json({ message: "appointment not found" });
      }
      return res.status(200).json({ message: "delete id successfully" });
    });
  }
);

adminRouter.get(
  "/all-appointment",
  authMiddleware,
  roleMiddleWare("admin"),
  (req, res) => {
    // Query to fetch appointments joined with doctors and users
    const getAppointments = `
      SELECT 
        healthhaven.appointments.id as appiontmentId,
         users.name AS userName,
         users.email as userEmail,
         appointments.appointment_time as appointmentTime,
         appointments.appointment_date as appointmentDate,
         doctors.name as doctorName,
         doctors.email as doctorEmail,
         doctors.fees as appoitmentFees,
         appointments.status as appointmentStatus
      FROM 
        healthhaven.appointments
       inner JOIN 
    healthhaven.users inner join healthhaven.doctors where healthhaven.users.id=healthhaven.appointments.user_id and healthhaven.doctors.id=healthhaven.appointments.doctor_id;
    `;

    dbConnect.query(getAppointments, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
      }
      // Send the combined result
      res.status(200).send(result);
    });
  }
);

module.exports = adminRouter;
