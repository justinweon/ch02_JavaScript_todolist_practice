const form = document.querySelector('form');
const allTask =document.querySelector('#allTask');
const input = document.querySelector('input');

form.addEventListener('submit', (e)=>{
    e.preventDefault();

    const text= input.value.trim();

    if (text=="")
        return;

    const parent = document.createElement('div');
})