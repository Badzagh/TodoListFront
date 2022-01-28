import './App.css';
import { useState, useEffect, useRef } from "react";
import axios from 'axios';


let activePageNum = 1;
let maxPageNum = 1;

function App() {

  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [editItemName, setEditItemName] = useState("")
  const [visibilityEditInputContainer, setVisibilityEditInputContainer] = useState("input-edit-container-hidden");
  const [pageCount, setPageCount] = useState([]);
  const [itemId, setItemId] = useState("");
  const [activePageNumIncr, setActivePageNumIncr] = useState(1);
  
  const checkRef = useRef();

  //make get request
  const makeRequest = (Page) => {
    axios({
      method: 'get',
      url: `http://localhost:3000/items/choose?page=${Page}`,
      headers: {
          "Content-Type": "application/json"
        }
      })
      .then((response) => {
        
        setItems(response.data.Info);
        response.data.Info.forEach((item, index) => {

          if(item.checkTask === "complete"){
          
            let arr = checkRef.current;
    
            arr.children[index].children[1].className = "check-btn-complete-" + index;
            arr.children[index].children[2].className = "task-info-complete-" + index;
          }

        })
      })
  }
  //
  useEffect(() => {
    setTimeout(() => {
      makeRequest(1)
    }, 100)
  }, [])
  
  //page counter
  useEffect(() => {

    setTimeout(() => {
      axios({
        method: 'get',
        url: `http://localhost:3000/items`,
        headers: {
            "Content-Type": "application/json"
        }
      })
      .then((response) => {
        // handle success
        pageCount.push(maxPageNum)
        for(let i = 1; i < response.data.length; i++){
          if(i > maxPageNum  * 5){
            maxPageNum++;
            pageCount.push(maxPageNum);
          }
        }
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
        url: 'http://localhost:3000/items/add',
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
      .then((response) =>  {
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
    }
  }

  //Edit
  const handleClickEdit = (e) => {
    setItemId(e.target.value);
    items.forEach((item, index) => {
      if(item._id === e.target.value){
        setEditItemName(item.name);
        setVisibilityEditInputContainer("input-edit-container-" + index);
      }
    })
  }

  const handleInputEditChange = (e) => {
    setEditItemName(e.target.value);
  }

  const handleClickEditSave = (e) => {

    setVisibilityEditInputContainer("input-edit-container-hidden");
    //  put request
    axios({
      method: 'put',
      url: `http://localhost:3000/items/change/${itemId}`,
      responseType: 'json',
      data : {
          name: editItemName
      },
    })
    .then((response) =>  {
      window.location.reload();
    })
    .catch((error) => {
      console.log(error);
    });
  }

  const handleClickEditCancel = (e) => {
    setVisibilityEditInputContainer("input-edit-container-hidden")
  }

  //Delete
  const handleClickDelete = (e) => {

    axios.delete(`http://localhost:3000/items/delete/${e.target.value}`, {
      body: e.target.value
    })
    .then((res) => {
      window.location.reload();
    })
  }

  //check task
  const checkTaskReq = (check, itemId) => {
    axios({
        method: 'put',
        url: `http://localhost:3000/items/change/${itemId}`,
        responseType: 'json',
        data : {
            checkTask: check
        },
        })
        .then((response) =>  {
        console.log(response);
        window.location.reload();
        })
        .catch((error) => {
        console.log(error);
        });
  }
  //complete task
  const handleClickComplete = (e) => {
    items.forEach((item, index) => {
      if(item._id === e.target.id){
        
        e.target.className = "check-btn-complete-" + index;
        let arr = checkRef.current;
        arr.children[index].children[2].className = "task-info-complete-" + index;
      } 
    })
    checkTaskReq("complete", e.target.id);
  }

  //unfinished
  const handleClickUnfinished = (e) => {
    
    items.forEach((item, index) => {
      if(item._id === e.target.id){

        e.target.className = "check-btn-complete-hidden";
        let arr = checkRef.current;
        arr.children[index].children[2].className = "task-info";
      } 
    })

    checkTaskReq("unfinished", e.target.id);
  }
  
  //back
  const handleClickBack = (e) => {
    if(activePageNum > 1){

      activePageNum--;

      setTimeout(() => {
        makeRequest(activePageNum)
      }, 100)
    }
  }

  //next
  const handleClickNext = (e) => {
    if(activePageNum < maxPageNum){

      activePageNum++;

      setActivePageNumIncr(activePageNum);

      setTimeout(() => {
        makeRequest(activePageNum)
      }, 100)
    }  
  }

  //choose page
  const handleClickChoosenPage = (e) => {

    activePageNum = e.target.innerHTML;
    
    setTimeout(() => {
      makeRequest(activePageNum)
    }, 100)
  }



  return (
    <div>
        <div className="header">
            <h1>Todo List</h1>
            <div id="active-page-container">
              <div className="active-page">Page {activePageNum}</div>
            </div>
        </div>
        <div className="add-item-container">
              <label>ADD ITEM:</label><br /><br />
              <input onChange={e => handleInputChange(e)} type="text" name="input-new-item" id="input-new-item" value={itemName} />
              <button onClick={handleClick} id="input-button" type="submit">ADD</button>
              <div id="page-count-container"></div>
              <button onClick={handleClickBack} id="back-btn">back</button>
              <button onClick={handleClickNext} id="next-btn">next</button>
              <div id="page-count-container">
                {pageCount.map(num => (
                  <div key={num} onClick={handleClickChoosenPage} className="page-count">{num}</div>
                ))}  
              </div>
        </div>
        <div className="list-container">
              <h3>TODO</h3>
              <div id="list" ref={checkRef}>
                  {items.map((item, index) => (
                    <div key={item._id} className="item">
                      
                      <div onClick={handleClickComplete} id ={item._id} className="check-btn"></div>
                      <div onClick={handleClickUnfinished} id={item._id} className="check-btn-complete-hidden"></div>
                      <span className="info">{item.name}</span>
                      <div>
                        <button onClick={handleClickEdit} value={item._id} className="edit-btn">Edit</button>
                        <button onClick={handleClickDelete} value={item._id} className="delete-btn">Delete</button>
                      </div>
                      </div>
                  ))}
                  <div className={visibilityEditInputContainer}>
                      <input onChange={e => handleInputEditChange(e)} value={editItemName} className="input-edit"/>
                      <button onClick={handleClickEditSave} className="save-btn">Save</button>
                      <button onClick={handleClickEditCancel} className="cancel-btn">Cancel</button>
                  </div>
              </div>
        </div>
    </div>
  );
}


export default App;
