<script>
  import { Block,Sheet,
    Button,
    Toolbar,Stepper,BlockTitle,List,ListItem,Radio,
    Link } from 'konsta/svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    export let header = "";
    export let options = [];
    export let selectedValue ="";

    function setOption(option){
        dispatch('set-selected', { 
            option
        });
    }
</script>
<BlockTitle>{header}</BlockTitle>
<List strongIos outlineIos>

{#each options as option}
<ListItem label title={option}>
<Radio
    slot="after"
    component="div"
    value={option}
    checked={selectedValue===option}
    onChange={() => setOption({[header]:option})}
/>
</ListItem>
{/each}
</List>