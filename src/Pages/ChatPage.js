import { Box } from "@chakra-ui/layout";
import { ChatState } from "../Context/ChatProvider";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { useState } from "react";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  // const [chats, setChats] = useState([]);
  // const fetchChats = async () => {
  //   const { data } = await axios.get("/api/chat");
  //   setChats(data);
  // };

  // useEffect(() => {
  //   fetchChats();
  // }, []);

  return (
    
    // <div>
    //   {chats.map((e) => (
    //     <div key={e._id}>{e.chatName}</div>
    //   ))}
    // </div>

    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
