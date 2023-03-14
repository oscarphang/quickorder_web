<script>
  import { App, Page, Navbar, Block,List,Sheet,
    Button,
    Toolbar,
    Link,Dialog,DialogButton,ListInput,BlockTitle } from 'konsta/svelte';
  import MenuItem from './lib/MenuItem.svelte';
  import MenuDetail from './lib/MenuDetail.svelte';
  import menuData from './data/menu.json';
  import tableData from './data/table.json'
  import menuItemOptions from './data/menuItemTypeOptions.json';
  import _ from 'lodash';
  import Paho from 'paho-mqtt';
  // Create a client instance
  let client;


  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    client.subscribe("order/drinks");
  }


  let menu = menuData.items.map(x=>({...x,options:menuItemOptions[x.type]}));
  let orders = [];
  function onOrderChanged({detail:{id,price,options,diff}}){
    const getSameOrder = x=>x.id==id&&_.isEqual(x.options,options)&&_.isEqual(x.price,price);
    const order = orders.find(getSameOrder);
    if (order){
      orders = orders.map(x=>getSameOrder(x)?{...x,price,qtyOrdered:x.qtyOrdered+diff}:x)
    }else{
      const selectedItem = menuData.items.find(x=>x.id==id);
      orders = [...orders,{...selectedItem,options,price,qtyOrdered:diff}]
    }
    orders = orders.filter(x=>x.qtyOrdered>0);

  
    client = new Paho.Client("<mqtt_server>", Number("<mqtt_port>"), "<MQTT topic>");
    client.connect({
      onSuccess: onConnect, 
      userName : "<mqtt_user>",
      password : "<mqtt_pass>", 
      useSSL: true
    });
  }
  let showOrderedMessage = false;

  function onOrderSubmit(){
    const msg = [`Table - ${tableId}`,...exactOrders].join(" \n\n");

    const message = new Paho.Message(msg);
    message.destinationName = "order/drinks";
    message.qos = 0;

    client.send(message);
    orders = [];
    showOrderedMessage=true;
    sheetOpened = false;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const isTableEditable = urlParams.get("tid") === null;
  let tableId = urlParams.get("tid") || "";
  let tableEditorOpened = tableId=="";
  let sheetOpened = false;
  let optionOpened = false;
  let currentSelectedItem = {};
  let selectedTable= tableData.items[0];
  function onSetTable(){
    tableId = selectedTable;
    tableEditorOpened = false;
  }
  function setSelectedItem(item){
    currentSelectedItem = {...item,qtyOrdered:1};
    optionOpened=true;
  }
  function setOptionOpened({detail:{isOpen}}){
    optionOpened=isOpen;
  }
  $: exactOrders = orders.filter(x=>x.qtyOrdered>0).map(x=>`${x.name} - ${Object.keys(x.price).join()} x${x.qtyOrdered} ${Object.values(x.options).length>0?"\n- ":""}${Object.values(x.options).join("\n- ")}`);
  $: allowToOrder = orders.length>0;
</script>

<main>
  <App theme="ios">
    <Page>
      <Navbar title="">
        <svelte:fragment slot="title"><span on:click={()=>{if (isTableEditable)tableEditorOpened=true}}>{`Order: Table ${tableId}`}</span></svelte:fragment>
      </Navbar>
      <BlockTitle>Drinks</BlockTitle>
      <List strong inset>
        {#each menu as menuItem}
          <MenuItem  id={menuItem.id} 
              name={menuItem.name} description={menuItem.description} price={menuItem.price}
              on:set-selected={()=>setSelectedItem(menuItem)}/>
        {/each}
      </List>
    <Dialog opened={showOrderedMessage} onBackdropClick={() => (showOrderedMessage = false)}>
    <svelte:fragment slot="title">Thank you</svelte:fragment>
    Your order has sent to kitchen!
    <svelte:fragment slot="buttons">
      <DialogButton onClick={() => (showOrderedMessage = false)}>Ok</DialogButton>
    </svelte:fragment>
  </Dialog>
  <Sheet
    class="pb-safe w-full"
    opened={sheetOpened}
    onBackdropClick={() => (sheetOpened = false)}
  >
    <Toolbar top>
      <div class="left" />
      <div class="right">
        <Link toolbar onClick={() => (sheetOpened = false)}>Done</Link>
      </div>
    </Toolbar>
    <Block>
      <div >
      <ul>
      {#each orders.filter(x=>x.qtyOrdered>0) as orderItem}
          <li class="flex justify-between">
            <div>{`${orderItem.name} - ${Object.keys(orderItem.price).join()} - ${Object.values(orderItem.options).join(",")} x${orderItem.qtyOrdered}`}</div>
            <div>
              <Button class="k-color-brand-red" onClick={()=>onOrderChanged({detail:{id:orderItem.id,price:orderItem.price,options:orderItem.options,diff:-1}})} outline>-</Button>
            </div>
          </li>
      {/each}
      </ul>
      </div>
      <div class="mt-4">
        <Button onClick={onOrderSubmit}>Confirm Order</Button>
      </div>
    </Block>
  </Sheet>
  <Sheet
    class="pb-safe w-full"
    opened={tableEditorOpened}
    onBackdropClick={() => (tableEditorOpened = false)}
  >
    <Toolbar top>
      <div class="left" />
      <div class="right">
        <Link toolbar onClick={() => (tableEditorOpened = false)}>Done</Link>
      </div>
    </Toolbar>
    <Block>
      <List strongIos insetIos>
          <ListInput
            label="Table"
            type="select"
            dropdown
            value={selectedTable}
            defaultValue={selectedTable}
            placeholder="Please choose..."
          >
            {#each tableData.items as item}
              <option value={item}>
                {item}
              </option>
            {/each}
          </ListInput>

      
      </List>
      <div class="mt-4">
        <Button onClick={onSetTable}>Set Table</Button>
      </div>
    </Block>
  </Sheet>
  <MenuDetail {optionOpened} item={currentSelectedItem} on:order-changed={onOrderChanged} on:open-changed={setOptionOpened}/>
    {#if orders.length > 0}
 <Toolbar
    top={false}
    class={`left-0 bottom-0 fixed w-full`}
  >
    <Button onClick={() => (sheetOpened = true)}>Order</Button>
  </Toolbar>
    {/if}
   
  
    </Page>
  </App>
</main>