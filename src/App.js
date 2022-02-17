import './App.css';
import { useState, useEffect } from "react";
import axios from 'axios';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { Container, TextField, FormControlLabel, Box, Input } from '@mui/material';

let activePageNum = 1;
let maxPageNum = 1;

function App() {

  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [editItemName, setEditItemName] = useState("")
  const [visibilityEditInputContainer, setVisibilityEditInputContainer] = useState("input-edit-container-hidden");
  const [pageCount, setPageCount] = useState([]);
  const [itemId, setItemId] = useState("");
  const [page, setPage] = useState(1)
  const [taskComplete, setTaskComplete] = useState([false, false, false, false, false])
  const [txtEditButton, setTxtEditButton] = useState("Edit")
  const [txtDeleteButton, setTxtDeleteButton] = useState("Delete")

  //make get request
  const makeRequest = (Page) => {
    axios({
      method: 'get',
      url: `https://new-website-todo.herokuapp.com/items/choose?page=${Page}`,
      headers: {
          "Content-Type": "application/json"
        }
      })
      .then((response) => {

        response.data.Info.forEach((item, index) => {

          if(item.checkTask === "complete"){
            taskComplete[index] = true
          } else {
            taskComplete[index] = false
          }
          setTaskComplete(taskComplete)
          
        })
        setItems(response.data.Info);
      })
  }

  //
  useEffect(() => {
    //page counter
    setTimeout(() => {
      axios({
        method: 'get',
        url: `https://new-website-todo.herokuapp.com/items`,
        headers: {
            "Content-Type": "application/json"
        }
      })
      .then((response) => {
        pageCount.push(maxPageNum)
        for(let i = 1; i < response.data.length; i++){
          if(i > maxPageNum  * 5){
            maxPageNum++;
            pageCount.push(maxPageNum);
          }
        }
      }).then(() => {
        makeRequest(1)
      })
    }, 10)
  }, [])

  //
  const handleInputChange = (e) => {
    e.preventDefault();
    setItemName(e.target.value);
  }

  const handleClick = (e) => {
  
    e.preventDefault();
    
    addItem(itemName.trim())
    setItemName("");
  }

  //add item
  const addItem = (newItem) => {

    if(itemName && newItem){    

      axios({
        method: 'post',
        url: 'https://new-website-todo.herokuapp.com/items/add',
        responseType: 'json',
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"
        },
        data : {
            name: newItem,
            checkTask: "unfinished"
        }
      })
      .then(() =>  {
        //move on last page 
        setTimeout(() => {
          axios({
            method: 'get',
            url: `https://new-website-todo.herokuapp.com/items`,
            headers: {
                "Content-Type": "application/json"
            }
          })
          .then((response) => {
            pageCount.push(maxPageNum)
            for(let i = 1; i < response.data.length; i++){
              if(i > maxPageNum  * 5){
                maxPageNum++;
                pageCount.push(maxPageNum);
              }
            }
          }).then(() => {
            makeRequest(maxPageNum)
            setPage(maxPageNum)
          })
        }, 10)
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }

  //Edit/Save
  const handleClickEditSave = (e) => {

    setItemId(e.target.value);

    items.forEach((item, index) => {
      if(item._id === e.target.value){
        setEditItemName(item.name);
        setVisibilityEditInputContainer("input-edit-container-" + index);
      }
    })

    setTxtEditButton("Save");
    setTxtDeleteButton("Cancel");

    if(e.target.name === "Save"){

      setVisibilityEditInputContainer("input-edit-container-hidden");
      setTxtEditButton("Edit");
      setTxtDeleteButton("Delete");

      //  put request
      axios({
        method: 'put',
        url: `https://new-website-todo.herokuapp.com/items/change/${itemId}`,
        responseType: 'json',
        data : {
            name: editItemName
        },
      })
      .then(() =>  {
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
      }
  }

  const handleInputEditChange = (e) => {
    setEditItemName(e.target.value);
  }

  //Delete/Cancel
  const handleClickDeleteCancel = (e) => {
    if(e.target.name === "Delete"){
      axios.delete(`https://new-website-todo.herokuapp.com/items/delete/${e.target.value}`, {
        body: e.target.value
      })
      .then(() => {
        window.location.reload();
      })
    } else {
    
      setVisibilityEditInputContainer("input-edit-container-hidden")
      setTxtEditButton("Edit");
      setTxtDeleteButton("Delete");
    }
  }

  //check task
  const checkTaskReq = (check, itemId) => {
    axios({
        method: 'put',
        url: `https://new-website-todo.herokuapp.com/items/change/${itemId}`,
        responseType: 'json',
        data : {
            checkTask: check
        },
        })
        .catch((error) => {
        console.log(error);
        });
  }
  ///
  const CheckTaskChange = (e) => {
    taskComplete[e.target.value] = !taskComplete[e.target.value]
    setTaskComplete(taskComplete)
      if(taskComplete[e.target.value]){
        checkTaskReq("complete", e.target.id);
      } else {
        checkTaskReq("unfinished", e.target.id);
      }
  }
  
  //choose page
  const handleChangeChoosePage = (event, value) => {
    
    setPage(value);
    activePageNum = value;

    setTimeout(() => {
      makeRequest(activePageNum)
    }, 10)
  };
  //

  return (
    <div>
        <Box className="header" sx={{ maxWidth: '100%' }}>
            <Typography variant="h1" style={{fontSize: "30px", marginTop: "40px"}} >Todo List</Typography>
            <Typography mt={2} >Page: {page}</Typography>
        </Box>
        <Box  sx={{ maxWidth: '45%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginLeft: "auto",
                    marginRight: "auto",
                    paddingTop: "150px"
                  }}> 
            <Box minWidth={"297px"}>                                   
              <TextField 
                required size="small" 
                id="outlined-basic" 
                label="ADD ITEM" 
                variant="outlined" 
                onChange={e => handleInputChange(e)} 
                type="text" 
                name="input-new-item" 
                id="input-new-item" 
                value={itemName} 
              />
              <Button size="medium" onClick={handleClick} id="input-button" type="submit">ADD</Button>
            </Box>  
        </Box>
        <Box className="list-container" sx={{ maxWidth: '50%', height: "400px", minWidth: "300px" }}>          
          <Typography variant="h3" style={{fontSize: "20px", marginBottom: "10px", paddingTop: "35px", paddingLeft: "32px"}} >TODO</Typography>
          <Container sx={{height: "225px"}}>
            {items.map((item, index) => (
              <Box 
                key={item._id} 
                sx={{   
                  display: "flex",
                  alignItems: "center",
                  justifyContent: 'space-between',
                  height: "25px",
                  paddingBottom: "8.5px",
                  paddingTop: "8.5px"
                }}>
                <FormControlLabel 
                  value={index} 
                  style={{
                            pointerEvents: "none" , 
                            overflow: "hidden", 
                            textOverflow: "ellipse", 
                            width: "140px", 
                            marginRight: "0px",
                            height: "25px",
                            paddingBottom: "8.5px",
                            paddingTop: "8.5px"
                  }} 
                  control={<Checkbox defaultChecked={taskComplete[index]}  style={{ pointerEvents: "auto" }} onChange={CheckTaskChange} id ={item._id} />} 
                  label={item.name} 
                />
                <Box>
                  <Button onClick={handleClickEditSave} value={item._id} className="edit-btn" name={txtEditButton} >{txtEditButton}</Button>
                  <Button onClick={handleClickDeleteCancel} value={item._id} className="delete-btn" name={txtDeleteButton} >{txtDeleteButton}</Button>
                </Box>
              </Box>
            ))}
            <Box className={visibilityEditInputContainer} >
              <Input style={{backgroundColor: "#F9F7F7"}} onChange={e => handleInputEditChange(e)} value={editItemName} className="input-edit"/>
            </Box>
          </Container>
          <Stack spacing={2} mt={5} ml={"auto"} mr={"auto"} width={"267px"}>
            <Pagination count={maxPageNum} siblingCount={0} page={page} onChange={handleChangeChoosePage} />
          </Stack>
        </Box>
    </div>
  );
}


export default App;
