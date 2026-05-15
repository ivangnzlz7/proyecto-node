
async function loadData(){
    try{
        const res = await fetch('http://jsonplaceholder.typicode.com/posts');
        const data = await res.json();
        console.log(data);
    } catch(error) {
        console.log(error);
    }
}

loadData();