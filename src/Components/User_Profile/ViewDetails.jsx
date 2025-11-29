import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../User_Profile/Header";
import Settings from "../HomePage/Settings";

export default function ViewDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_BASE_URL || "";

  useEffect(() => {
    async function fetchData() {
      try {
        const url = API_BASE
          ? `${API_BASE}/subsidy/applications/${id}/`
          : `/subsidy/applications/${id}/`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access") || ""}`,
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Application not found");
        const data = await res.json();

        // ======== SAFE EXTRACTION ========
        const officer = data.assigned_officer || {};

        setApplication({
          farmer_name: data.full_name || "—",

          assigned_officer_name:
            officer.full_name || "Not Assigned",

          assigned_officer_email:
            officer.email_address || "Not Available",

          subsidy_name:
            data.subsidy?.title ||
            data.subsidy?.name ||
            "Not Available",

          applied_on: data.submitted_at
            ? new Date(data.submitted_at).toLocaleDateString()
            : "Not Available",

          account_number: data.account_number || "—",
          ifsc: data.ifsc || "—",
          status: data.status || "—",
        });

      } catch (err) {
        console.error(err);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!application) return <p className="text-center mt-10">Application not found</p>;

  return (
    <>
      <Header />
      <Settings />

      <div className="w-full bg-gray-100 min-h-screen p-6 flex justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl w-full">

          <h1 className="text-2xl font-bold text-green-700 mb-4">
            Application Details
          </h1>

          <p><strong>Farmer Name:</strong> {application.farmer_name}</p>

          <p className="mt-4">
            <strong>Assigned Officer:</strong> {application.assigned_officer_name}
          </p>

          <p className="mt-1">
            <strong>Officer Email:</strong> {application.assigned_officer_email}
          </p>

          <p className="mt-4">
            <strong>Subsidy Applied:</strong> {application.subsidy_name}
          </p>

          <p className="mt-4">
            <strong>Applied On:</strong> {application.applied_on}
          </p>

          <h2 className="text-xl font-bold mt-6">Bank Details</h2>

          <p className="mt-2">
            <strong>Account Number:</strong> {application.account_number}
          </p>
          <p className="mt-1">
            <strong>IFSC Code:</strong> {application.ifsc}
          </p>

          <h2 className="text-xl font-bold mt-6">Status</h2>

          <p className="mt-2">
            <strong>Current Status:</strong> {application.status}
          </p>

        </div>
      </div>
    </>
  );
}
