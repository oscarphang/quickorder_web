<script>
    import { Block,Sheet,
    Button,
    Toolbar,Stepper,BlockTitle,List,ListItem,Radio,
    Link } from 'konsta/svelte';
    import { createEventDispatcher } from 'svelte';
    import OptionList from './OptionList.svelte';
    const dispatch = createEventDispatcher();
    export  let optionOpened = false;
    export let item = {
        id:0,
        name : "",
        description : "",
        priceByType :{}
    };
    let selectedOptions = {};
    let selectedPricedOption={};
    let selectedPricedOptionValue="";
    let qtyOrdered = 1;
    const setSheetOpen = (isOpen) => {
        dispatch('open-changed', { 
            isOpen
        });
    };
    const increase = () => {
        qtyOrdered=qtyOrdered+1;
    };
    const decrease = (options) => {
        if (qtyOrdered>0){
            qtyOrdered=qtyOrdered-1;
        }
    };
    function resetState(){
        item = {
            id:0,
            name : "",
            description : ""
        };
        selectedOptions={};
        selectedPricedOption={};
        selectedPricedOptionValue="";
        qtyOrdered = 1;
    }
    function addOrder(){
        dispatch('order-changed', { 
            id:item.id,price:selectedPricedOption,options:selectedOptions,diff:qtyOrdered
        });
        setSheetOpen(false);
        resetState();
    }
    function cancelOrder(){
        setSheetOpen(false)
        resetState();
    }
    function setSelectedOption({detail:{option}}){
        selectedOptions={...selectedOptions,...option};
    }
    function setSelectedPricedOption({detail:{option}}){
        const priceByType = Object.entries(item.priceByType).find(([headerName, options])=>headerName==option["Please select"]);
        console.log(priceByType);
        if (priceByType){
            selectedPricedOption={[priceByType[0]]:priceByType[1]}
            selectedPricedOptionValue=priceByType[0];
        }else{
            selectedPricedOption={}
            selectedPricedOptionValue="";
        }
        
    }
    $: allowToOrder = item.options !== undefined&&Object.keys(selectedOptions).length == Object.keys(item.options).length && selectedPricedOptionValue !== "";
</script>


<Sheet
    class="pb-safe w-full"
    opened={optionOpened}
    onBackdropClick={cancelOrder}
>
    <Toolbar top>
        <div class="left" >{item.name}{selectedPricedOptionValue!==""?` - RM${Object.values(selectedPricedOption).join()}`:""}</div>
        <div class="right">
        <Link toolbar onClick={cancelOrder}>Close</Link>
        </div>
    </Toolbar>
    <Block strongIos outlineIos>
    <div class=" overflow-auto max-h-80">
        {#if item.options !== undefined}
            <OptionList on:set-selected={setSelectedPricedOption} header={"Please select"} options={Object.keys(item.priceByType)} selectedValue={selectedPricedOptionValue}/>
            {#each Object.entries(item.options) as [headerName, options]}
                <OptionList on:set-selected={setSelectedOption} header={headerName} options={options} selectedValue={selectedOptions[headerName]}/>
            {/each}
            
        {/if}
    </div>

    
    </Block>
    
    
    <Block>
      <div class="mt-4 flex">
        <Stepper slot="after" value={qtyOrdered} raised outline onPlus={increase} onMinus={decrease} />
        {#if qtyOrdered > 0}
            <Button onClick={addOrder} disabled={!allowToOrder}>Select</Button>
        {:else}
            <Button onClick={cancelOrder} clear>Cancel</Button>
        {/if}
        
      </div>
    </Block>
  </Sheet>