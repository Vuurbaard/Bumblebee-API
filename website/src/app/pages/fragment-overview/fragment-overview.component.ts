import { Component, OnInit } from '@angular/core';
import { FragmentService } from '../../services/fragment.service';

@Component({
  selector: 'app-fragment-overview',
  templateUrl: './fragment-overview.component.html',
  styleUrls: ['./fragment-overview.component.css']
})
export class FragmentOverviewComponent implements OnInit {

  public frags : Array<any>;
  public something : string;

  constructor(private fragmentService: FragmentService){
    this.frags = [];
  };



  ngOnInit() {
    var me = this;
    this.something = "Stupid";
    this.fragmentService.all().subscribe(data => {
      this.something = "Not so stupid";
      this.frags = data;    
      console.log(this.frags);
    });
  }

}

