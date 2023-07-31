import React, { useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// import { useHistory } from "react-router-dom";


const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const toast = useToast();
const [loading, setLoading] = useState(false);
      const navigate = useNavigate();
// const history = useHistory();

  const handleClick = () => setShow(!show);

   const submitHandler = async () => {
     setLoading(true);

     if (!email || !password) {
       toast({
         title: "Please Fill all the Feilds",
         status: "warning",
         duration: 5000,
         isClosable: true,
         position: "top",
       });
       setLoading(false);
       return;
     }

     // console.log(email, password);

     try {
       const config = {
         headers: {
           "Content-type": "application/json",
         },
       };

       const { data } = await axios.post(
         "http://localhost:3002/api/user/login",
         { email, password },
         config
       );

       // console.log(JSON.stringify(data));

       window.location.reload(true);
       window.location.reload(false);

       toast({
         title: "Login Successful",
         status: "success",
         duration: 5000,
         isClosable: true,
         position: "top",
       });


       localStorage.setItem("userInfo", JSON.stringify(data));


         setLoading(false);
       navigate("/chats");
       
      //  history.push("/chats");
       
     } catch (error) {
       toast({
         title: "Error Occured!",
         description: error.response.data.message,
         status: "error",
         duration: 5000,
         isClosable: true,
         position: "top",
       });
       setLoading(false);
     }
   };

    return (
      <>
        <img
          src="https://t3.ftcdn.net/jpg/01/82/04/38/360_F_182043866_cQZwPYqKo2xZvZ8sSwW7rdRbf72GcsH4.jpg"
          alt="Sample"
        />

        <VStack spacing="50px" color="black">
          <FormControl id="Email" isRequired>
            <FormLabel color="white">Email</FormLabel>
            <Input
              color="white"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id="Password" isRequired>
            <FormLabel color="white">Password</FormLabel>
            <InputGroup>
              <Input
                color="white"
                type={show ? "text" : "password"}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleClick}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            colorScheme="cyan"
            width="100%"
            style={{ marginTop: 15 }}
            onClick={submitHandler}
            isLoading={loading}
          >
            {/* {" "} */}
            Login
          </Button>
          <Button
            variant="solid"
            colorScheme="red"
            width="100%"
            onClick={() => {
              setEmail("develop@gmail.com");
              setPassword("develop");
            }}
          >
            Get Guest User Credentials
          </Button>
        </VStack>
      </>
    );
};

export default Login;
