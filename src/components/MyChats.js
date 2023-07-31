import { AddIcon } from '@chakra-ui/icons';
import { Box,Stack,Text } from '@chakra-ui/layout';
import axios from "axios";
import React, { useState, useEffect } from 'react';

import { ChatState } from '../Context/ChatProvider';
import { useToast } from '@chakra-ui/react';
import { Button } from '@chakra-ui/button';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics';
import GroupChatModel from './miscellaneous/GroupChatModel';
const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log("this is user token", user.token);
    if (user.token) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          "http://localhost:3002/api/chat",
          config
        );
        // console.log(chats);

        setChats(data);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the chats",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain,user]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      padding={3}
      background="#282829ca"
      width={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderColor="grey"
      borderWidth="1px"
    >
      <Box
        paddingBottom={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="#000000e9"
        color="white"
      >
        My Chats
        <GroupChatModel>
          <Button
            marginTop={2.5}
            color="black"
            backgroundColor="#ded9d9"
            display="flex"
            fontSize={{ base: "15px", md: "10px", lg: "15px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModel>
      </Box>
      <Box
        marginTop={2}
        display="flex"
        flexDir="column"
        padding={3}
        background="#000000e9"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#57eec3" : "#3f4041ea"}
                color={selectedChat === chat ? "black" : "white"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
