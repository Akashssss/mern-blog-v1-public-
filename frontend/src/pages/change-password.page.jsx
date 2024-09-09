import React, { useContext, useRef } from 'react'
import AnimationWrapper from './../common/page-animation';
import InputBox from './../components/input.component';
import { UserContext } from './../App';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
export default function ChangePassword() {
  let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
  const { userAuth: { access_token

  } } = useContext(UserContext);
  let changePasswordForm = useRef();
  const handleSubmit = async (e) => {
    e.preventDefault();

    let form = new FormData(changePasswordForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;
    if (!currentPassword.trim().length || !newPassword.trim().length) {
      return toast.error("Fill all the fields.");
    }
    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
      return toast.error("Passeord shouldbe 6 to 20 characters long with a numeric ,one lowecase and one uppercase character.");
    }

    e.target.setAttribute("disabled", true);
    let loadingToast = toast.loading("Updating...");
    try {
      await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      changePasswordForm.current.reset();
      return toast.success("Password changed successfully");


    } catch (error) {
      toast.dismiss(loadingToast);
      e.target.removeAttribute("disabled");
      changePasswordForm.current.reset();
      return toast.error(error.message);
    }

  }

  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm}>
        <h1 className='max-md:hidden'>Change password</h1>
        <div className='py-10 w-full md:max-w-[400px]'>
          <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Current password" icon="unlock" />
          <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="New password" icon="unlock" />

          <button
            onClick={handleSubmit}

            className='btn-dark px-10' type="submit">
            Change pasword
          </button>
        </div>
      </form>
    </AnimationWrapper>
  )
}
