

export default interface Bootable{
	boot() : Promise<this>;
}