import React,{useState} from 'react'
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Tooltip } from "@chakra-ui/tooltip";
import { ChatState } from '../../Context/ChatProvider';
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import { getSender } from '../../config/ChatLogics';
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {
  Drawer,
  useDisclosure,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  Spinner,
  useToast
} from "@chakra-ui/react";
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
// import NotificationBadge from "react-notification-badge";
// import { Effect } from "react-notification-badge";
const SideDrawer = () => {
     const [search, setSearch] = useState("");
     const [searchResult, setSearchResult] = useState([]);
     const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    

      const {
        setSelectedChat,
        user,
        notification,
        setNotification,
        chats,
        setChats,
    } = ChatState();
    
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const navigate = useNavigate();
  

      const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        // history.push("/");
        navigate('/')
      };

  
  const toast = useToast();

  const handleSearch = async () => { 
    if (!search) {
      toast({
        title: "Please Enter Something in Search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:3002/api/user?search=${search}`,
        config
      );
           setLoading(false);
           setSearchResult(data);
    } catch (error) {
        toast({
          title: "Error Occured!",
          description:"Failed To Load The Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
    

   
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:3002/api/chat",
        { userId },
        config
      );
      
      
      if (!chats.find((c) => c._id === data._id))
        setChats([data, ...chats]);
        
  setSelectedChat(data);
  setLoadingChat(false);
  onClose();


    } catch (error) {
      toast({
        title: "Error in fetching the Chats",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  }
    return (
      <>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          background="#282829ca"
          width="100%"
          padding="3px 10px 5px 10px"
          borderWidth="5px"
          borderColor="blackAlpha.900"
        >
          <div
            style={{
              borderWidth: "0.2px",
              borderRadius: "20px",
              borderColor: "grey",
              color: "black",
              background: "#ded9d9",
            }}
          >
            <Tooltip
              label="Search Users to chat"
              hasArrow
              placement="bottom-end"
            >
              <Button variant="ghost" onClick={onOpen}>
                <i className="fas fa-search"></i>
                <Text display={{ base: "none", md: "flex" }} px={4}>
                  Search User
                </Text>
              </Button>
            </Tooltip>
          </div>

          <Text fontSize="1.3rem" fontFamily="Work sans" color="white">
            Socio-Chit-Chat
          </Text>
          <div>
            <Menu>
              <MenuButton p={1}>
                <NotificationBadge
                  count={notification.length}
                  effect={Effect.SCALE}
                />
                <BellIcon fontSize="2xl" margin={1} color="white" />
              </MenuButton>
              <MenuList pl={2}>
                {!notification.length && "No New Messages"}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                background="#ded9d9"
                // background="white"
              >
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user.name}
                  src={user.pic}
                />
              </MenuButton>

              <MenuList background="black">
                <ProfileModal user={user}>
                  <MenuItem background="black" color="white">
                    My Profile
                  </MenuItem>
                  {/* {""} */}
                </ProfileModal>
                <MenuDivider />
                <MenuItem
                  onClick={logoutHandler}
                  background="black"
                  color="white"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </Box>

        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent
            background="#000000e9"
            borderWidth={2}
            borderRadius="5"
          >
            <DrawerHeader
              borderBottomWidth="1px"
              color="white"
              background="#78787a9d"
            >
              Search Users
            </DrawerHeader>
            <DrawerBody>
              <Box display="flex" paddingBottom={2}>
                <Input
                  color="white"
                  placeholder="Search by name or email"
                  mr={2}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
              </Box>
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              )}
              {loadingChat && <Spinner ml="auto" display="flex" />}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
}

export default SideDrawer
 