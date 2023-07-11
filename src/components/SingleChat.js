import React,{useState,useEffect} from 'react'
import { ChatState } from '../Context/ChatProvider'
import {
  Box,
  IconButton,
  Input,
  Spinner,
  Text,
  FormControl,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender,getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import ScrollableChat from "./ScrollableChat"
import io from 'socket.io-client'
const ENDPOINT = "http://localhost:3002";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

     const [message, setMessage] = useState([]);
    const [loading, setLoading] = useState(false);
      const [newMessage, setNewMessage] = useState();
    const [socketConnected,setSocketConnected]= useState(false)
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { user, selectedChat, setSelectedChat, notification,setNotification } = ChatState();
    
    const toast = useToast();

     const fetchMessages = async () => {
       if (!selectedChat) return;
       try {
         const config = {
           headers: {
             Authorization: `Bearer ${user.token}`,
           },
         };

         setLoading(true);

         const { data } = await axios.get(
           `http://localhost:3002/api/message/${selectedChat._id}`,
           config
         );
         setMessage(data);
           setLoading(false);
           
           socket.emit('join chat', selectedChat._id);

       } catch (error) {
         toast({
           title: "Error Occured",
           description: "Failed to send the message",
           status: "error",
           duration: 5000,
           isClosable: true,
           position: "top",
         });
       }
    };
    
     useEffect(() => {
       socket = io(ENDPOINT);
       socket.emit("setup", user);
         socket.on("connected", () => setSocketConnected(true));
         
         socket.on('typing',()=>setIsTyping(true))
         socket.on('stop typing',()=>setIsTyping(false))
     }, []);

     useEffect(() => {
       fetchMessages();

       selectedChatCompare = selectedChat;
     }, [selectedChat]);

     useEffect(() => {
         socket.on("message recieved", (newMessageRecieved) => {
           if (
             !selectedChatCompare ||
             selectedChatCompare._id !== newMessageRecieved.chat._id
           ) {
             //give notification
                if (!notification.includes(newMessageRecieved)) {
                  setNotification([newMessageRecieved, ...notification]);
                  setFetchAgain(!fetchAgain);
                }
           } else {
             setMessage([...message, newMessageRecieved]);
           }
         });
     });
    
    
    const sendMessage = async (e) => {
        if (e.key === "Enter" && newMessage) {
     socket.emit("stop typing", selectedChat._id);
     try {
       const config = {
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${user.token}`,
         },
       };
         setNewMessage("");
         
       const { data } = await axios.post(
         "http://localhost:3002/api/message",
         {
           content: newMessage,
           chatId: selectedChat._id,
         },
         config
       );

    //    console.log(data);
        //  setNewMessage("");
       socket.emit('new message', data);
          setMessage([...message, data]);
     } catch (error) {
       toast({
         title: "Error Occured",
         description: "Failed to send the message",
         status: "error",
         duration: 5000,
         isClosable: true,
         position: "top",
       });
     }
   }
    };
      const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
          setTyping(true);
          socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        let timerLength = 3000;

        setTimeout(() => {
          let timeNow = new Date().getTime();
          let timeDiff = timeNow - lastTypingTime;

          if (timeDiff >= timerLength && typing) {
            socket.emit("stop typing", selectedChat._id);
            setTyping(false);
          }
        }, timerLength);
      };

    
 
    // const ScrollableChat = () => { };
    
    // const isTyping = (e) => { 
    //   setNewMessage(e.target.value);  
    // };
   

    return (
      <>
        {selectedChat ? (
          <>
            {" "}
            <Text
              fontSize={{ base: "25px", md: "27px" }}
              pb={3}
              px={2}
              width="100%"
              fontFamily="Work sans"
              fontWeight="bold"
              display="flex"
              justifyContent={{ base: "space-between" }}
              alignItems="center"
              color="white"
            >
              <IconButton
                color="black"
                backgroundColor="#ded9d9"
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />
              {!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              )}
            </Text>
            <Box
              className="chatarea"
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              p={3}
              // background="#E8E8E8"
              width="100%"
              height="100%"
              borderRadius="lg"
              overflowY="hidden"
            >
              {/* MESSAGES HERE------------ */}

              {loading ? (
                <Spinner
                  size="xl"
                  width={20}
                  height={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                <div className="messages">
                  <ScrollableChat message={message} />
                </div>
              )}

              <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                {isTyping ? (
                  <div style={{ color: "grey" }}>typing....</div>
                ) : (
                  <></>
                )}
                            <Input
                  color="white"
                  variant="filled"
                  background="#78787a61"
                  placeholder="Enter a message.."
                  onChange={typingHandler}
                  value={newMessage}
                            />
              </FormControl>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
          >
            <Text fontSize="3xl" pb={3} fontFamily="worksans">
              Click on User to Start the Conversation
            </Text>
          </Box>
        )}
      </>
    );
};

    export default SingleChat;
