import { Component, OnInit } from '@angular/core';
import { FragmentService } from '../../services/fragment.service';

@Component({
  selector: 'app-fragment-overview',
  templateUrl: './fragment-overview.component.html',
  styleUrls: ['./fragment-overview.component.css']
})
export class FragmentOverviewComponent implements OnInit {

  
  constructor(private fragmentService: FragmentService){
    this.fragments = [];
  };

  fragments : Array<any>;

  ngOnInit() {
    var me = this;

    this.fragmentService.all().subscribe(data => {
      this.fragments = data;    
      console.log(this);
    })
  }

}

