import React from 'react';
import { useForm } from 'react-hook-form';
import { useRegisterUserMutation, useLoginMutation } from '../features/api/user.api';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from './index';

function Signup() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [login] = useLoginMutation();
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    try {
      const payload = {
        ...data,
        addresses: [{
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          type: data.addressType || 'home',
          isDefault: true,
        }],
      };

      const res = await registerUser(payload).unwrap();
      if (res) {
        await login({ email: data.email, password: data.password }).unwrap();
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.data?.error || err.data?.message || err.error || 'Signup failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center px-6">
      <div className="w-full max-w-5xl bg-white p-10 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create Your Account
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Full Name */}
          <div>
            <Input
              placeholder="Full Name"
              {...register('name', { required: 'Name is required' })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Input
              type="email"
              placeholder="Email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Input
              placeholder="Phone Number"
              {...register('phone', {
                pattern: {
                  value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                  message: 'Invalid phone number',
                },
              })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register('password', { required: 'Password is required' })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              {...register('confirmPassword', {
                validate: (value, formValues) =>
                  value === formValues.password || 'Passwords do not match',
              })}
              className=" text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Street (span 2 cols on md) */}
          <div className="md:col-span-2 lg:col-span-3">
            <Input
              placeholder="Street Address"
              {...register('street', { required: 'Street is required' })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <Input
              placeholder="City"
              {...register('city', { required: 'City is required' })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <Input
              placeholder="State"
              {...register('state', { required: 'State is required' })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
            )}
          </div>

          {/* Zip Code */}
          <div>
            <Input
              placeholder="Zip Code"
              {...register('zipCode', {
                required: 'Zip Code is required',
                pattern: {
                  value: /^[1-9][0-9]{5}$/, 
                  message: 'Invalid zip code format',
                },
              })}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            />
            {errors.zipCode && (
              <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>
            )}
          </div>

          {/* Address Type */}
          <div>
            <select
              {...register('addressType')}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            >
              <option value="home">Home</option>
              <option value="office">Office</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <select
              {...register('role')}
              className="text-black w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-none bg-white"
            >
              <option value="customer">Customer</option>
              <option value="tailor">Tailor</option>
            </select>
          </div>

          {/* Submit Button spans full width */}
          <div className="md:col-span-2 lg:col-span-3 text-center mt-4">
            <Button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;