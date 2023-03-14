<script>
    import { ListItem,Stepper,Card } from 'konsta/svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let id = 1;
    export let name = "";
    // export let price = 0.0;
    function setSelectedItem(){
         dispatch('set-selected', { 
            id
        });
    }
</script>

 <ListItem><div on:click={setSelectedItem} class="dark:text-white text-black font-bold mb-3 mx-4">{name}</div>
      </ListItem>

