import React, { useState, useEffect, useRef, useContext } from "react";
import AuthContext from "../context/AuthContext";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
} from "@nextui-org/react";
import "./css/Profilecard.css";
import { Input, Avatar } from "@nextui-org/react";
import { CameraIcon } from "./CameraIcon";

function ProfileCard() {
  const { authTokens, user_type, user } = useContext(AuthContext);
  const [userFullname, setUserFullname] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [profileURL, setProfileURL] = useState("");
  const [profileEndpoint, setProfileEndpoint] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (authTokens) {
        setUserFullname(user.full_name);
        setUserName(user.username);
        setUserEmail(user.email);
        let endpoint = "";
        switch (user_type) {
          case "student":
            endpoint = "http://localhost:8000/accounts/student-profile/";
            break;
          case "mentor":
            endpoint = "http://localhost:8000/accounts/mentor-profile/";
            break;
          case "recruiter":
            endpoint = "http://localhost:8000/accounts/recruiter-profile/";
            break;
          default:
            console.error("Invalid user type:", user_type);
            return;
        }

        setProfileEndpoint(endpoint);
        const token = authTokens.access;
        const response = await fetch(profileEndpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            console.log(data);
            setProfileURL(data[0].profile_photo);
          }
        } else {
          console.error("Error fetching data:", response.statusText);
        }
      }
    };

    fetchUserProfile();
  }, [authTokens, user_type, profileEndpoint, user]);
  const fileInputRef = useRef(null);

  const handleProfileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setProfileFile(selectedFile);
    }
  };

  const handleUpdateProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleSaveClick = async () => {
    if (authTokens) {
      const token = authTokens.access;
      const formData = new FormData();
      if (profileFile !== null) {
        formData.append("profile_photo", profileFile);
      } else {
        formData.append("profile_photo", "");
      }

      console.log("Request Data:", Object.fromEntries(formData));
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      };

      try {
        console.log(profileEndpoint);
        const response = await fetch(profileEndpoint, requestOptions);

        if (response.ok) {
          console.log("Data saved successfully!");
        } else {
          console.error("Error saving data:", response.statusText);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error);
      }
    }
    console.log(profileURL);
  };

  return (
    <div className="profile-card">
      <Popover showArrow placement="bottom" radius="none">
        <PopoverTrigger>
          <button className="button">
            <div className="profile-button-content">
              <div className="profile-user-name">{userFullname}</div>
              <div className="profile-icon-container">
                <img
                  className="profile-icon"
                  src={
                    profileFile ? URL.createObjectURL(profileFile) : profileURL
                  }
                  alt="Icon"
                />
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] h-[500px] ">
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          <Avatar
            src={profileFile ? URL.createObjectURL(profileFile) : profileURL}
            size="sm"
            className="w-20 h-20 text-large mx-auto mb-2"
          />

          <div className="text-xs text-center text-red-600 mb-4">
            Note : Upload only passport-size photo for verification purposes.
          </div>
          <Button
            className=" bg-black text-white"
            size="sm"
            endContent={<CameraIcon />}
            onClick={handleUpdateProfileClick}
          >
            Update Photo
          </Button>
          <div className=" m-3 w-5/6 ">
            <Input
              type="text"
              label="Full Name"
              placeholder={userFullname}
              size="md"
              className="mb-5"
              disabled
            />
            <Input
              type="text"
              label="Username"
              size="md"
              placeholder={userName}
              className="mb-5"
              disabled
            />
            <Input
              type="text"
              label="Email"
              size="md"
              className="mb-5"
              placeholder={userEmail}
              disabled
            />
            <div className="flex justify-end ">
              <Button
                size="sm"
                className="rounded-lg bg-black text-white"
                onClick={handleSaveClick}
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default ProfileCard;
